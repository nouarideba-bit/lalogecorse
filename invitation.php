<?php
declare(strict_types=1);

const DEST       = 'jeromebrigato@lalogecorse.fr';
const MAX_GUESTS = 4;
const SITE       = 'https://lalogecorse.fr';

function clean(string $v, int $max = 200): string {
    $v = trim($v);
    $v = preg_replace('/[\r\n]+/', ' ', $v);
    return mb_substr($v, 0, $max);
}
function field(string $key, int $max = 200): string {
    return isset($_POST[$key]) && is_string($_POST[$key]) ? clean($_POST[$key], $max) : '';
}
function page(string $title, string $msg, bool $ok): void {
    $t = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $m = htmlspecialchars($msg, ENT_QUOTES, 'UTF-8');
    $c = $ok ? '#0f2b5b' : '#a32018';
    echo '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width, initial-scale=1">'
       . '<title>' . $t . ' &mdash; La Loge Corse</title><style>'
       . 'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;'
       . 'background:#f6f1e4;color:#1c1c1c;font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px}'
       . '.card{background:#fff;border:1px solid #e3dccb;border-radius:16px;padding:36px;max-width:540px}'
       . 'h1{font-size:24px;margin:0 0 12px;color:' . $c . '}p{margin:0 0 20px;color:#555}'
       . 'a{display:inline-block;background:#54c7ee;color:#06283d;text-decoration:none;font-weight:700;padding:11px 20px;border-radius:999px}'
       . '</style></head><body><div class="card"><h1>' . $t . '</h1><p>' . $m . '</p>'
       . '<a href="' . SITE . '">Retour au site</a></div></body></html>';
}
function fail(string $msg, int $code = 400): void {
    http_response_code($code);
    page('Demande non envoyee', $msg, false);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: ' . SITE);
    exit;
}

$societe  = field('societe');
$referent = field('referent');
$email    = field('referent_email');
$tel      = field('referent_tel', 40);
$match    = field('match', 300);
$message  = field('message', 2000);

if ($societe === '' || $referent === '' || $email === '' || $tel === '' || $match === '') {
    fail('Merci de completer la societe, votre nom, votre e-mail, votre telephone et le match souhaite.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('L adresse e-mail du partenaire n est pas valide.');
}
if (!isset($_POST['consent'])) {
    fail('Vous devez confirmer avoir l accord de vos invites pour transmettre leurs coordonnees.');
}

$guests = [];
foreach ($_POST as $key => $ignored) {
    if (preg_match('/^invite(\d+)_nom$/', (string) $key, $mm)) {
        $i      = $mm[1];
        $nom    = field("invite{$i}_nom");
        $prenom = field("invite{$i}_prenom");
        $gmail  = field("invite{$i}_email");
        $gtel   = field("invite{$i}_tel", 40);
        if ($nom === '' && $prenom === '' && $gmail === '' && $gtel === '') { continue; }
        if ($nom === '' || $prenom === '' || $gmail === '' || $gtel === '') {
            fail('Chaque invite doit avoir un nom, un prenom, un e-mail et un telephone.');
        }
        if (!filter_var($gmail, FILTER_VALIDATE_EMAIL)) {
            fail('L adresse e-mail de l invite ' . $prenom . ' ' . $nom . ' n est pas valide.');
        }
        $guests[] = ['nom' => $nom, 'prenom' => $prenom, 'mail' => $gmail, 'tel' => $gtel];
    }
}
if (!$guests) { fail('Merci de renseigner au moins un invite.'); }
if (count($guests) > MAX_GUESTS) { fail('Vous pouvez inviter au maximum ' . MAX_GUESTS . ' personnes.'); }

$L   = [];
$L[] = 'DEMANDE D INVITATION - LA LOGE CORSE';
$L[] = str_repeat('=', 46);
$L[] = '';
$L[] = 'Match       : ' . $match;
$L[] = '';
$L[] = 'PARTENAIRE';
$L[] = '  Societe   : ' . $societe;
$L[] = '  Referent  : ' . $referent;
$L[] = '  E-mail    : ' . $email;
$L[] = '  Telephone : ' . $tel;
$L[] = '';
$L[] = 'INVITES (' . count($guests) . '/' . MAX_GUESTS . ')';
foreach ($guests as $k => $g) {
    $L[] = sprintf('  %d. %s %s', $k + 1, $g['prenom'], $g['nom']);
    $L[] = '     E-mail    : ' . $g['mail'];
    $L[] = '     Telephone : ' . $g['tel'];
}
if ($message !== '') { $L[] = ''; $L[] = 'MESSAGE'; $L[] = '  ' . $message; }
$L[] = '';
$L[] = str_repeat('-', 46);
$L[] = 'Recue le ' . date('d/m/Y a H:i');

$body    = implode("\n", $L);
$subject = 'Invitation Loge Corse - ' . $societe . ' (' . count($guests) . ' invite'
         . (count($guests) > 1 ? 's' : '') . ')';
$headers = implode("\r\n", [
    'From: La Loge Corse <no-reply@lalogecorse.fr>',
    'Reply-To: ' . $referent . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
]);

$sent = @mail(DEST, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
if (!$sent) {
    fail('L envoi a echoue. Ecrivez-nous directement a ' . DEST . ' - nous traiterons votre demande.', 500);
}

@mail($email, '=?UTF-8?B?' . base64_encode('Votre demande d invitation - La Loge Corse') . '?=',
    "Bonjour,\n\nNous avons bien recu votre demande pour :\n" . $match
    . "\n\nElle sera pre-validee puis confirmee par e-mail.\n\nRecapitulatif :\n\n" . $body
    . "\n\nA bientot a Jean-Bouin.\nLa Loge Corse", $headers);

page('Demande envoyee',
    'Merci ' . $referent . ' - votre demande pour ' . $match . ' a bien ete transmise. '
    . 'Vous recevrez un e-mail de confirmation apres pre-validation.', true);
