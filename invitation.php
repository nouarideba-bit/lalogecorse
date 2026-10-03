<?php
/**
 * La Loge Corse : réception des demandes d'invitation (version 2, octobre 2026).
 * Reçoit le formulaire de la page d'accueil, valide les champs, bloque les robots
 * et transmet la demande par e-mail pour pré-validation.
 */

declare(strict_types=1);

const DEST        = 'jeromebrigato@lalogecorse.fr';
const MAX_GUESTS  = 6;
const SITE        = 'https://lalogecorse.fr';
const MIN_SECONDS = 4;       // un humain met plus de 4 s à remplir le formulaire
const MAX_SECONDS = 86400;   // formulaire ouvert depuis plus de 24 h : recharger
const RATE_MAX    = 5;       // demandes maximum par adresse IP…
const RATE_WINDOW = 3600;    // …et par heure

/* -------------------------------------------------------------------------- */

function clean(string $v, int $max = 200): string
{
    $v = trim($v);
    $v = preg_replace('/[\r\n\t]+/', ' ', $v);   // anti-injection d'en-têtes
    $v = preg_replace('/[\x00-\x1F\x7F]/u', '', $v);
    return mb_substr($v, 0, $max);
}

function field(string $key, int $max = 200): string
{
    return isset($_POST[$key]) && is_string($_POST[$key]) ? clean($_POST[$key], $max) : '';
}

function fail(string $msg, int $code = 400): never
{
    http_response_code($code);
    page('Demande non envoyée', $msg, false);
    exit;
}

function page(string $title, string $msg, bool $ok): void
{
    $t = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $m = htmlspecialchars($msg, ENT_QUOTES, 'UTF-8');
    $c = $ok ? '#071F4B' : '#a32018';
    $back = $ok ? SITE : 'javascript:history.back()';
    $label = $ok ? 'Retour au site' : 'Revenir au formulaire';
    echo <<<HTML
<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>$t · La Loge Corse</title>
<link rel="icon" href="/favicon.ico">
<style>
 body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#F5EFE0;color:#071F4B;font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px}
 .card{background:#FFFDF8;border:1px solid #E4DCC8;border-radius:14px;padding:36px;max-width:540px;box-shadow:0 18px 40px -18px rgba(7,31,75,.35)}
 .card img{width:56px;height:56px;border-radius:8px}
 h1{font-size:26px;margin:16px 0 10px;color:$c;text-transform:uppercase;letter-spacing:.01em}
 p{margin:0 0 22px;color:#4C5A75}
 a{display:inline-block;background:#54C7EE;color:#05283a;text-decoration:none;font-weight:700;padding:11px 20px;border-radius:3px}
</style></head><body>
<div class="card"><img src="/assets/img/la-loge-corse.webp" alt="La Loge Corse"><h1>$t</h1><p>$m</p><a href="$back">$label</a></div>
</body></html>
HTML;
}

/* Limite le nombre d'envois par adresse IP (fichier dans le dossier temporaire). */
function rate_limited(): bool
{
    $ip   = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
    $file = rtrim(sys_get_temp_dir(), '/') . '/lalogecorse_rate_' . hash('sha256', $ip . __FILE__);
    $now  = time();
    $hits = [];
    if (is_readable($file)) {
        $hits = array_filter(
            array_map('intval', explode(',', (string) file_get_contents($file))),
            fn ($t) => $t > $now - RATE_WINDOW
        );
    }
    if (count($hits) >= RATE_MAX) {
        return true;
    }
    $hits[] = $now;
    @file_put_contents($file, implode(',', $hits), LOCK_EX);
    return false;
}

/* Le match doit exister dans le calendrier et ne pas être déjà joué. */
function valid_match(string $match): bool
{
    $path = __DIR__ . '/matchs.json';
    if (!is_readable($path)) {
        return $match !== '';            // calendrier absent : on ne bloque pas
    }
    $list  = json_decode((string) file_get_contents($path), true) ?: [];
    $today = (new DateTimeImmutable('today', new DateTimeZone('Europe/Paris')))->format('Y-m-d');
    foreach ($list as $m) {
        if (($m['label'] ?? '') === $match) {
            return ($m['date'] ?? '') >= $today;
        }
    }
    return false;
}

/* -------------------------------------------------------------------------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: ' . SITE . '/#reserver');
    exit;
}

// Robots : champ piège rempli, formulaire envoyé trop vite ou périmé.
// On répond comme si tout allait bien, sans rien envoyer.
$ts = (int) field('ts', 20);
if (field('website') !== '' || $ts === 0 || time() - $ts < MIN_SECONDS) {
    page('Demande envoyée', 'Merci, votre demande a bien été transmise.', true);
    exit;
}
if (time() - $ts > MAX_SECONDS) {
    fail('Le formulaire était ouvert depuis trop longtemps. Rechargez la page et recommencez, s’il vous plaît.');
}
if (rate_limited()) {
    fail('Trop de demandes ont été envoyées depuis votre connexion. Réessayez dans une heure ou écrivez à ' . DEST . '.', 429);
}

// Champs partenaire
$societe  = field('societe');
$referent = field('referent');
$email    = field('referent_email');
$tel      = field('referent_tel', 40);
$match    = field('match', 300);
$message  = field('message', 2000);

if ($societe === '' || $referent === '' || $email === '' || $tel === '' || $match === '') {
    fail('Merci de compléter la société, votre nom, votre e-mail, votre téléphone et le match souhaité.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('L’adresse e-mail du partenaire n’est pas valide.');
}
if (!preg_match('/^[0-9 +().\-]{6,40}$/', $tel)) {
    fail('Le numéro de téléphone du partenaire n’est pas valide.');
}
if (!valid_match($match)) {
    fail('Ce match n’est plus disponible à la réservation. Choisissez une affiche à venir.');
}
if (!isset($_POST['consent'])) {
    fail('Vous devez confirmer avoir l’accord de vos invités pour transmettre leurs coordonnées.');
}

// Invités : nom, prénom, e-mail et téléphone obligatoires pour chacun.
$guests = [];
foreach ($_POST as $key => $_) {
    if (preg_match('/^invite(\d{1,3})_nom$/', (string) $key, $m)) {
        $i      = $m[1];
        $nom    = field("invite{$i}_nom");
        $prenom = field("invite{$i}_prenom");
        $gmail  = field("invite{$i}_email");
        $gtel   = field("invite{$i}_tel", 40);

        if ($nom === '' && $prenom === '' && $gmail === '' && $gtel === '') {
            continue; // bloc vide ignoré
        }
        if ($nom === '' || $prenom === '' || $gmail === '' || $gtel === '') {
            fail('Chaque invité doit avoir un nom, un prénom, un e-mail et un téléphone.');
        }
        if (!filter_var($gmail, FILTER_VALIDATE_EMAIL)) {
            fail("L’adresse e-mail de l’invité « $prenom $nom » n’est pas valide.");
        }
        $guests[] = compact('nom', 'prenom', 'gmail', 'gtel');
    }
}

if (!$guests) {
    fail('Merci de renseigner au moins un invité.');
}
if (count($guests) > MAX_GUESTS) {
    fail('Vous pouvez inviter au maximum ' . MAX_GUESTS . ' personnes par match.');
}

/* -------------------------------------------------------------------------- */

$lines   = [];
$lines[] = 'DEMANDE D’INVITATION · LA LOGE CORSE';
$lines[] = str_repeat('=', 46);
$lines[] = '';
$lines[] = 'Match       : ' . $match;
$lines[] = '';
$lines[] = 'PARTENAIRE';
$lines[] = '  Société   : ' . $societe;
$lines[] = '  Référent  : ' . $referent;
$lines[] = '  E-mail    : ' . $email;
$lines[] = '  Téléphone : ' . $tel;
$lines[] = '';
$lines[] = 'INVITÉS (' . count($guests) . '/' . MAX_GUESTS . ')';
foreach ($guests as $k => $g) {
    $lines[] = sprintf('  %d. %s %s', $k + 1, $g['prenom'], $g['nom']);
    $lines[] = '     E-mail    : ' . $g['gmail'];
    $lines[] = '     Téléphone : ' . $g['gtel'];
}
if ($message !== '') {
    $lines[] = '';
    $lines[] = 'MESSAGE';
    $lines[] = '  ' . $message;
}
$lines[] = '';
$lines[] = str_repeat('-', 46);
$lines[] = 'Reçue le ' . (new DateTimeImmutable('now', new DateTimeZone('Europe/Paris')))->format('d/m/Y à H:i');
$lines[] = 'Demande à pré-valider.';

$body    = implode("\n", $lines);
$subject = 'Invitation Loge Corse · ' . $societe . ' (' . count($guests) . ' invité'
         . (count($guests) > 1 ? 's' : '') . ')';

$enc = fn (string $s) => '=?UTF-8?B?' . base64_encode($s) . '?=';

$headers = implode("\r\n", [
    'From: ' . $enc('La Loge Corse') . ' <no-reply@lalogecorse.fr>',
    'Reply-To: ' . $enc($referent) . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$sent = @mail(DEST, $enc($subject), $body, $headers, '-fno-reply@lalogecorse.fr');

if (!$sent) {
    fail('L’envoi a échoué. Écrivez-nous directement à ' . DEST . ' : nous traiterons votre demande.', 500);
}

// Accusé de réception au partenaire (sans bloquer en cas d'échec).
$ackHeaders = implode("\r\n", [
    'From: ' . $enc('La Loge Corse') . ' <no-reply@lalogecorse.fr>',
    'Reply-To: ' . DEST,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);
@mail(
    $email,
    $enc('Votre demande d’invitation · La Loge Corse'),
    "Bonjour,\n\nNous avons bien reçu votre demande pour :\n" . $match .
    "\n\nElle sera pré-validée puis confirmée par e-mail.\n\nRécapitulatif :\n\n" . $body .
    "\n\nÀ bientôt à Jean-Bouin.\nLa Loge Corse\n" . SITE,
    $ackHeaders,
    '-fno-reply@lalogecorse.fr'
);

page(
    'Demande envoyée',
    'Merci ' . $referent . ', votre demande pour ' . $match . ' a bien été transmise. '
    . 'Vous recevrez un e-mail de confirmation après validation.',
    true
);
