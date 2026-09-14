<?php
/* =====================================================================
   La Loge Corse — Espace partenaire
   Inscription (validée par Jérôme Brigato), demande d'invitations,
   génération des invitations nominatives après validation.
   Stockage : fichiers JSON dans un dossier protégé. Aucune base requise.
   ===================================================================== */

declare(strict_types=1);

const ADMIN_EMAIL  = 'jeromebrigato@lalogecorse.fr';
const ADMIN_NAME   = 'Jérôme Brigato';
const FROM_EMAIL   = 'no-reply@lalogecorse.fr';
const SITE_NAME    = 'La Loge Corse';
const MAX_GUESTS   = 4;
const DATA_DIR     = __DIR__ . '/donnees-loge';
const LOGIN_TRIES  = 8;
const LOGIN_WINDOW = 900;   /* 15 minutes */

/* --------------------------------------------------------------- socles */

function base_url(): string {
    $s = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $h = $_SERVER['HTTP_HOST'] ?? 'lalogecorse.fr';
    $p = $_SERVER['SCRIPT_NAME'] ?? '/espace.php';
    return $s . '://' . $h . $p;
}

function data_dir(): string {
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0750, true);
    }
    $ht = DATA_DIR . '/.htaccess';
    if (!file_exists($ht)) {
        @file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n");
    }
    $ix = DATA_DIR . '/index.html';
    if (!file_exists($ix)) {
        @file_put_contents($ix, '');
    }
    return DATA_DIR;
}

function store_read(string $name): array {
    $f = data_dir() . '/' . $name . '.json';
    if (!is_file($f)) return [];
    $raw = @file_get_contents($f);
    if ($raw === false || $raw === '') return [];
    $j = json_decode($raw, true);
    return is_array($j) ? $j : [];
}

/* Lit, laisse le callback modifier, réécrit — le tout sous verrou. */
function store_update(string $name, callable $fn) {
    $f = data_dir() . '/' . $name . '.json';
    $h = fopen($f, 'c+');
    if ($h === false) return null;
    flock($h, LOCK_EX);
    $raw  = stream_get_contents($h);
    $rows = $raw !== '' ? json_decode($raw, true) : [];
    if (!is_array($rows)) $rows = [];
    $ret  = $fn($rows);
    ftruncate($h, 0);
    rewind($h);
    fwrite($h, json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($h);
    flock($h, LOCK_UN);
    fclose($h);
    @chmod($f, 0640);
    return $ret;
}

function h(?string $s): string {
    return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function token(int $n = 16): string {
    return bin2hex(random_bytes($n));
}

function now(): string {
    return date('c');
}

function send_mail(string $to, string $subject, string $html): bool {
    $headers   = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/html; charset=UTF-8';
    $headers[] = 'From: ' . SITE_NAME . ' <' . FROM_EMAIL . '>';
    $headers[] = 'Reply-To: ' . ADMIN_EMAIL;
    $subject   = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    return @mail($to, $subject, $html, implode("\r\n", $headers), '-f' . FROM_EMAIL);
}

function mail_wrap(string $titre, string $corps): string {
    return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1c2430;line-height:1.6">'
         . '<h2 style="font-family:Arial,Helvetica,sans-serif;color:#071F4B;margin:0 0 14px">' . $titre . '</h2>'
         . $corps
         . '<p style="margin-top:26px;font-size:12px;color:#6b7683">' . SITE_NAME . ' — Stade Jean-Bouin, Paris.</p>'
         . '</div>';
}

function bouton(string $url, string $texte, string $fond = '#071F4B'): string {
    return '<p style="margin:22px 0"><a href="' . h($url) . '" style="background:' . $fond
         . ';color:#fff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:bold;display:inline-block">'
         . h($texte) . '</a></p>';
}

/* --------------------------------------------------------------- session */

function boot_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'secure'   => $secure,
        'samesite' => 'Lax',
    ]);
    session_name('LOGECORSE');
    session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = token(16);
}

function csrf_field(): string {
    return '<input type="hidden" name="csrf" value="' . h($_SESSION['csrf'] ?? '') . '">';
}

function csrf_ok(): bool {
    return isset($_POST['csrf'], $_SESSION['csrf'])
        && hash_equals((string)$_SESSION['csrf'], (string)$_POST['csrf']);
}

function partenaire_courant(): ?array {
    if (empty($_SESSION['pid'])) return null;
    foreach (store_read('partenaires') as $p) {
        if ($p['id'] === $_SESSION['pid'] && ($p['statut'] ?? '') === 'actif') return $p;
    }
    return null;
}

/* limitation des tentatives de connexion */
function trop_de_tentatives(string $cle): bool {
    $rows = store_read('tentatives');
    $n = 0;
    foreach ($rows as $r) {
        if ($r['k'] === $cle && (time() - (int)$r['t']) < LOGIN_WINDOW) $n++;
    }
    return $n >= LOGIN_TRIES;
}

function note_tentative(string $cle): void {
    store_update('tentatives', function (array &$rows) use ($cle) {
        $rows[] = ['k' => $cle, 't' => time()];
        $rows = array_values(array_filter($rows, fn($r) => (time() - (int)$r['t']) < LOGIN_WINDOW));
    });
}

function purge_tentatives(string $cle): void {
    store_update('tentatives', function (array &$rows) use ($cle) {
        $rows = array_values(array_filter($rows, fn($r) => $r['k'] !== $cle));
    });
}

/* --------------------------------------------------------------- données */

function societes(): array {
    return [
        'ELYDAN',
        'City Sécurité',
        'IE Pro',
        'Busca (Groupe BME)',
        'Groupe MC',
        'La Loge Corse & Kalliste Partners',
        'BME France',
        'Mederreg',
        'Futur Services',
        'C.M.E — Climatisation Maintenance Électrique',
        'Zaloc',
        'Braxton Retail',
        'Aspen Groupe / Marline',
        'Triangul Invest',
        'EBPS',
    ];
}

function affiches(): array {
    return [
        ['J2',  'OGC Nice',              'dim. 30 août 2026',  '15h00'],
        ['J4',  'Olympique Lyonnais',    'sam. 12 sept. 2026', '20h45'],
        ['J5',  'RC Strasbourg',         'sam. 19 sept. 2026', '17h15'],
        ['J7',  'Stade Rennais FC',      'dim. 18 oct. 2026',  '17h15'],
        ['J9',  'AS Monaco',             'dim. 1 nov. 2026',   '17h15'],
        ['J11', 'Angers SCO',            'dim. 22 nov. 2026',  '15h00'],
        ['J13', 'Le Mans FC',            'sam. 5 déc. 2026',   '18h00'],
        ['J15', 'Le Havre AC',           'sam. 2 janv. 2027',  '18h00'],
        ['J16', 'Toulouse FC',           'sam. 16 janv. 2027', '18h00'],
        ['J18', 'AJ Auxerre',            'sam. 30 janv. 2027', '18h00'],
        ['J20', 'ESTAC Troyes',          'sam. 13 févr. 2027', '18h00'],
        ['J23', 'Stade Brestois 29',     'sam. 6 mars 2027',   '18h00'],
        ['J24', 'FC Lorient',            'sam. 13 mars 2027',  '18h00'],
        ['J26', 'Paris Saint-Germain',   'sam. 3 avr. 2027',   '18h00'],
        ['J29', 'RC Lens',               'sam. 24 avr. 2027',  '18h00'],
        ['J31', 'LOSC Lille',            'sam. 8 mai 2027',    '18h00'],
        ['J33', 'Olympique de Marseille','sam. 22 mai 2027',   '18h00'],
    ];
}

function libelle_affiche(array $a): string {
    return $a[0] . ' — Paris FC / ' . $a[1] . ' (' . $a[2] . ' — ' . $a[3] . ')';
}

/* --------------------------------------------------------------- gabarit */

function page_haut(string $titre, string $sous = ''): void {
    header('Content-Type: text/html; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    echo '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width,initial-scale=1">'
       . '<meta name="robots" content="noindex,nofollow">'
       . '<title>' . h($titre) . ' · ' . SITE_NAME . '</title>'
       . '<link rel="preconnect" href="https://fonts.googleapis.com">'
       . '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
       . '<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">'
       . '<style>' . css() . '</style></head><body>'
       . '<header class="eb"><a class="eb-logo" href="/">' . SITE_NAME . '</a>'
       . '<nav class="eb-nav"><a href="/">Retour au site</a>';
    if (partenaire_courant()) {
        echo '<a href="?a=logout">Se déconnecter</a>';
    }
    echo '</nav></header><main class="wrap">'
       . '<h1>' . h($titre) . '</h1>'
       . ($sous !== '' ? '<p class="lead">' . $sous . '</p>' : '');
}

function page_bas(): void {
    echo '</main><footer class="ef">' . SITE_NAME . ' · Stade Jean-Bouin, Paris · '
       . '<a href="mailto:' . ADMIN_EMAIL . '">' . ADMIN_EMAIL . '</a></footer></body></html>';
}

function css(): string {
    return <<<'CSS'
*{box-sizing:border-box;margin:0;padding:0}
:root{--navy:#071F4B;--navy3:#3E5C8C;--sky:#54C7EE;--coral:#E9584C;
--paper:#FBF8F3;--cream:#F4EFE6;--line:#E3DCD1;--ink:#1C2430;--ink-soft:#6B7683}
body{background:var(--cream);color:var(--ink);font-family:Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;
font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--navy)}
.eb{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
background:var(--navy);color:#fff;padding:16px 22px}
.eb-logo{font-family:"Barlow Condensed",Arial,sans-serif;font-weight:800;font-size:22px;
text-transform:uppercase;letter-spacing:.02em;color:#fff;text-decoration:none}
.eb-nav{display:flex;gap:18px;flex-wrap:wrap}
.eb-nav a{font-family:"DM Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.08em;
text-transform:uppercase;color:#CBD9EC;text-decoration:none}
.eb-nav a:hover{color:#fff}
.wrap{max-width:780px;margin:0 auto;padding:38px 18px 60px}
h1{font-family:"Barlow Condensed",Arial,sans-serif;font-weight:800;font-size:clamp(30px,5vw,44px);
text-transform:uppercase;color:var(--navy);line-height:1.05;text-wrap:balance}
h2{font-family:"Barlow Condensed",Arial,sans-serif;font-weight:700;font-size:23px;
text-transform:uppercase;color:var(--navy);margin-bottom:12px}
.lead{color:var(--ink-soft);margin-top:12px;max-width:60ch}
.card{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:24px;margin-top:24px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:15px}
label{display:flex;flex-direction:column;gap:6px;font-size:12.5px;font-weight:600;color:var(--navy)}
label.span{grid-column:1/-1}
.req{color:var(--coral)}
input,select,textarea{font:inherit;font-size:14px;font-weight:400;color:var(--ink);
border:1px solid var(--line);border-radius:9px;padding:10px 12px;background:#fff;width:100%}
input:focus,select:focus,textarea:focus{outline:2px solid var(--sky);outline-offset:1px}
input:user-invalid,select:user-invalid{border-color:var(--coral)}
.btn{display:inline-block;border:0;border-radius:999px;padding:12px 24px;font:inherit;font-weight:700;
font-size:14px;cursor:pointer;text-decoration:none;transition:transform .18s,box-shadow .18s}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 24px -14px rgba(7,31,75,.75)}
.btn-sky{background:var(--sky);color:var(--navy)}
.btn-navy{background:var(--navy);color:#fff}
.btn-ghost{background:none;border:1px solid var(--navy);color:var(--navy)}
.btn-coral{background:var(--coral);color:#fff}
.actions{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-top:20px}
.msg{border-radius:10px;padding:13px 16px;margin-top:22px;font-size:14px}
.msg-ok{background:rgba(84,199,238,.15);border:1px solid rgba(84,199,238,.5);color:#13405e}
.msg-err{background:rgba(233,88,76,.1);border:1px solid rgba(233,88,76,.4);color:#9d2318}
.guest{border:1px dashed var(--line);border-radius:12px;padding:16px;margin-bottom:14px;background:var(--cream)}
.guest h3{font-family:"DM Mono",monospace;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;
color:var(--navy3);font-weight:500;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:14px}
th{font-family:"DM Mono",monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;
color:var(--ink-soft);text-align:left;font-weight:500;padding:12px 10px;border-bottom:1px solid var(--line)}
td{padding:12px 10px;border-bottom:1px solid var(--line);vertical-align:top}
tr:last-child td{border-bottom:none}
.tag{font-family:"DM Mono",monospace;font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;
padding:4px 9px;border-radius:4px;white-space:nowrap;display:inline-block}
.t-att{background:rgba(233,88,76,.12);color:#8A5A20}
.t-ok{background:rgba(84,199,238,.18);color:var(--navy3)}
.t-no{background:#EEE9E1;color:var(--ink-soft)}
.help{font-size:12.5px;color:var(--ink-soft);margin-top:10px}
.ef{text-align:center;font-size:12.5px;color:var(--ink-soft);padding:26px 18px 40px}
.inv{max-width:520px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:20px;overflow:hidden}
.inv-top{background:var(--navy);color:#fff;padding:26px}
.inv-top .eyebrow{font-family:"DM Mono",monospace;font-size:10px;letter-spacing:.13em;
text-transform:uppercase;color:var(--sky)}
.inv-top h2{color:#fff;font-size:30px;margin:8px 0 0}
.inv-body{padding:26px}
.inv-row{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid var(--line)}
.inv-row:last-of-type{border-bottom:none}
.inv-row .k{font-family:"DM Mono",monospace;font-size:10px;letter-spacing:.09em;
text-transform:uppercase;color:var(--ink-soft)}
.inv-row .v{font-weight:600;color:var(--navy);text-align:right}
.code{font-family:"DM Mono",monospace;font-size:21px;letter-spacing:.16em;color:var(--navy);
text-align:center;margin:18px 0 6px}
#qr{display:flex;justify-content:center;margin-top:16px}
#qr img,#qr canvas{max-width:100%;height:auto}
@media print{.eb,.ef,.no-print{display:none!important}body{background:#fff}}
CSS;
}

/* --------------------------------------------------------------- actions */

boot_session();
$action  = $_GET['a'] ?? '';
$erreur  = '';
$succes  = '';

/* ---- déconnexion ---- */
if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    header('Location: ' . base_url());
    exit;
}

/* ---- inscription ---- */
if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_ok()) {
        $erreur = 'Session expirée, merci de recommencer.';
    } else {
        $societe  = trim((string)($_POST['societe'] ?? ''));
        $referent = trim((string)($_POST['referent'] ?? ''));
        $email    = trim((string)($_POST['email'] ?? ''));
        $tel      = trim((string)($_POST['tel'] ?? ''));
        $login    = strtolower(trim((string)($_POST['login'] ?? '')));
        $mdp      = (string)($_POST['mdp'] ?? '');
        $mdp2     = (string)($_POST['mdp2'] ?? '');

        if (!in_array($societe, societes(), true))                 $erreur = 'Choisissez votre société dans la liste.';
        elseif ($referent === '')                                  $erreur = 'Indiquez votre nom et prénom.';
        elseif (!filter_var($email, FILTER_VALIDATE_EMAIL))        $erreur = 'L’adresse e-mail n’est pas valide.';
        elseif ($tel === '')                                       $erreur = 'Indiquez votre téléphone.';
        elseif (!preg_match('/^[a-z0-9._-]{3,32}$/', $login))      $erreur = 'L’identifiant doit faire 3 à 32 caractères (lettres, chiffres, point, tiret).';
        elseif (strlen($mdp) < 10)                                 $erreur = 'Le mot de passe doit faire au moins 10 caractères.';
        elseif ($mdp !== $mdp2)                                    $erreur = 'Les deux mots de passe ne sont pas identiques.';

        if ($erreur === '') {
            $res = store_update('partenaires', function (array &$rows) use ($societe, $referent, $email, $tel, $login, $mdp) {
                foreach ($rows as $r) {
                    if (strtolower($r['login']) === $login) return ['err' => 'Cet identifiant est déjà pris.'];
                }
                $p = [
                    'id'       => token(8),
                    'societe'  => $societe,
                    'referent' => $referent,
                    'email'    => $email,
                    'tel'      => $tel,
                    'login'    => $login,
                    'hash'     => password_hash($mdp, PASSWORD_DEFAULT),
                    'statut'   => 'attente',
                    'jeton'    => token(16),
                    'cree'     => now(),
                ];
                $rows[] = $p;
                return ['p' => $p];
            });

            if (isset($res['err'])) {
                $erreur = $res['err'];
            } else {
                $p   = $res['p'];
                $lien = base_url() . '?a=admin&t=' . $p['jeton'];
                send_mail(ADMIN_EMAIL, 'Nouveau compte partenaire à valider — ' . $p['societe'],
                    mail_wrap('Un partenaire demande l’accès à son espace',
                        '<p><strong>' . h($p['societe']) . '</strong><br>'
                        . h($p['referent']) . ' — ' . h($p['email']) . ' — ' . h($p['tel']) . '<br>'
                        . 'Identifiant choisi : <code>' . h($p['login']) . '</code></p>'
                        . '<p>Vous seul pouvez activer ce compte.</p>'
                        . bouton($lien, 'Examiner la demande')
                        . '<p style="font-size:12px;color:#6b7683">Ou copiez ce lien : ' . h($lien) . '</p>'));
                send_mail($p['email'], 'Votre demande d’accès à l’espace partenaire',
                    mail_wrap('Demande enregistrée',
                        '<p>Bonjour ' . h($p['referent']) . ',</p>'
                        . '<p>Votre demande d’accès à l’espace partenaire de ' . SITE_NAME . ' au nom de <strong>'
                        . h($p['societe']) . '</strong> a bien été enregistrée.</p>'
                        . '<p>' . ADMIN_NAME . ' la valide, puis vous recevrez un e-mail vous invitant à vous connecter '
                        . 'avec l’identifiant que vous avez choisi.</p>'));
                $succes = 'Votre demande est envoyée. Vous recevrez un e-mail dès que ' . ADMIN_NAME . ' aura activé votre compte.';
                $action = 'done';
            }
        }
    }
    if ($erreur !== '') $action = 'register';
}

/* ---- connexion ---- */
if ($action === '' && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if (!csrf_ok()) {
        $erreur = 'Session expirée, merci de recommencer.';
    } else {
        $login = strtolower(trim((string)$_POST['login']));
        $mdp   = (string)($_POST['mdp'] ?? '');
        $cle   = 'l:' . $login;
        if (trop_de_tentatives($cle)) {
            $erreur = 'Trop de tentatives. Réessayez dans un quart d’heure.';
        } else {
            $trouve = null;
            foreach (store_read('partenaires') as $p) {
                if (strtolower($p['login']) === $login) { $trouve = $p; break; }
            }
            if ($trouve && password_verify($mdp, $trouve['hash'])) {
                if (($trouve['statut'] ?? '') !== 'actif') {
                    $erreur = 'Votre compte n’est pas encore activé par ' . ADMIN_NAME . '.';
                } else {
                    purge_tentatives($cle);
                    session_regenerate_id(true);
                    $_SESSION['csrf'] = token(16);
                    $_SESSION['pid']  = $trouve['id'];
                    header('Location: ' . base_url());
                    exit;
                }
            } else {
                note_tentative($cle);
                $erreur = 'Identifiant ou mot de passe incorrect.';
            }
        }
    }
}

/* ---- dépôt d'une demande d'invitations ---- */
if ($action === 'new' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $moi = partenaire_courant();
    if (!$moi) {
        header('Location: ' . base_url());
        exit;
    }
    if (!csrf_ok()) {
        $erreur = 'Session expirée, merci de recommencer.';
    } else {
        $idx = (int)($_POST['affiche'] ?? -1);
        $aff = affiches()[$idx] ?? null;
        $invites = [];
        for ($i = 1; $i <= MAX_GUESTS; $i++) {
            $nom    = trim((string)($_POST["nom$i"] ?? ''));
            $prenom = trim((string)($_POST["prenom$i"] ?? ''));
            $mail   = trim((string)($_POST["email$i"] ?? ''));
            $tel    = trim((string)($_POST["tel$i"] ?? ''));
            if ($nom === '' && $prenom === '' && $mail === '' && $tel === '') continue;
            if ($nom === '' || $prenom === '' || $tel === '' || !filter_var($mail, FILTER_VALIDATE_EMAIL)) {
                $erreur = 'Pour l’invité ' . $i . ', le nom, le prénom, un e-mail valide et le téléphone sont obligatoires.';
                break;
            }
            $invites[] = ['nom' => $nom, 'prenom' => $prenom, 'email' => $mail, 'tel' => $tel, 'code' => strtoupper(bin2hex(random_bytes(4)))];
        }
        if ($erreur === '' && !$aff)              $erreur = 'Choisissez une affiche.';
        if ($erreur === '' && count($invites) < 1) $erreur = 'Renseignez au moins un invité.';

        if ($erreur === '') {
            $dem = [
                'id'        => token(8),
                'partenaire'=> $moi['id'],
                'societe'   => $moi['societe'],
                'referent'  => $moi['referent'],
                'email'     => $moi['email'],
                'affiche'   => libelle_affiche($aff),
                'invites'   => $invites,
                'message'   => trim((string)($_POST['message'] ?? '')),
                'statut'    => 'attente',
                'jeton'     => token(16),
                'cree'      => now(),
            ];
            store_update('demandes', function (array &$rows) use ($dem) { $rows[] = $dem; });

            $lien  = base_url() . '?a=admin&t=' . $dem['jeton'];
            $liste = '<ul>';
            foreach ($invites as $g) {
                $liste .= '<li><strong>' . h($g['prenom'] . ' ' . $g['nom']) . '</strong> — '
                        . h($g['email']) . ' — ' . h($g['tel']) . '</li>';
            }
            $liste .= '</ul>';
            send_mail(ADMIN_EMAIL, 'Demande d’invitations — ' . $dem['societe'] . ' — ' . $dem['affiche'],
                mail_wrap('Nouvelle demande d’invitations',
                    '<p><strong>' . h($dem['societe']) . '</strong> (' . h($dem['referent']) . ')<br>'
                    . 'Affiche : <strong>' . h($dem['affiche']) . '</strong></p>'
                    . '<p>Invités (' . count($invites) . ') :</p>' . $liste
                    . ($dem['message'] !== '' ? '<p>Message : ' . nl2br(h($dem['message'])) . '</p>' : '')
                    . '<p>Les invitations nominatives ne seront générées et envoyées qu’après votre validation.</p>'
                    . bouton($lien, 'Valider ou refuser')
                    . '<p style="font-size:12px;color:#6b7683">Ou copiez ce lien : ' . h($lien) . '</p>'));
            send_mail($moi['email'], 'Votre demande d’invitations est transmise',
                mail_wrap('Demande transmise',
                    '<p>Bonjour ' . h($moi['referent']) . ',</p>'
                    . '<p>Votre demande pour <strong>' . h($dem['affiche']) . '</strong> ('
                    . count($invites) . ' invité' . (count($invites) > 1 ? 's' : '') . ') est transmise à ' . ADMIN_NAME . '.</p>'
                    . '<p>Dès sa validation, chaque invité recevra son invitation nominative par e-mail, '
                    . 'et vous en recevrez la copie.</p>'));
            $succes = 'Demande envoyée. ' . ADMIN_NAME . ' la validera, puis les invitations partiront automatiquement.';
            $action = '';
        }
    }
}

/* ---- décision de l'administrateur (par jeton) ---- */
if ($action === 'admin') {
    $t = (string)($_GET['t'] ?? $_POST['t'] ?? '');
    $cible = null; $type = '';
    if ($t !== '') {
        foreach (store_read('partenaires') as $p) {
            if (hash_equals((string)($p['jeton'] ?? ''), $t)) { $cible = $p; $type = 'compte'; break; }
        }
        if (!$cible) {
            foreach (store_read('demandes') as $d) {
                if (hash_equals((string)($d['jeton'] ?? ''), $t)) { $cible = $d; $type = 'demande'; break; }
            }
        }
    }

    if (!$cible) {
        page_haut('Lien invalide', 'Ce lien de validation n’est plus actif : la décision a déjà été prise, ou le lien est incomplet.');
        echo '<div class="actions"><a class="btn btn-ghost" href="/">Retour au site</a></div>';
        page_bas();
        exit;
    }

    /* décision postée */
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['decision'])) {
        $ok = $_POST['decision'] === 'oui';

        if ($type === 'compte') {
            store_update('partenaires', function (array &$rows) use ($cible, $ok) {
                foreach ($rows as &$r) {
                    if ($r['id'] === $cible['id']) {
                        $r['statut'] = $ok ? 'actif' : 'refuse';
                        $r['jeton']  = '';
                        $r['decide'] = now();
                    }
                }
            });
            send_mail($cible['email'], $ok ? 'Votre espace partenaire est ouvert' : 'Votre demande d’accès',
                mail_wrap($ok ? 'Votre compte est activé' : 'Demande non retenue',
                    $ok
                    ? '<p>Bonjour ' . h($cible['referent']) . ',</p>'
                      . '<p>Votre compte <strong>' . h($cible['societe']) . '</strong> est activé. '
                      . 'Connectez-vous avec l’identifiant <code>' . h($cible['login']) . '</code> et le mot de passe que vous avez choisi.</p>'
                      . bouton(base_url(), 'Accéder à mon espace', '#54C7EE')
                    : '<p>Bonjour ' . h($cible['referent']) . ',</p>'
                      . '<p>Votre demande d’accès n’a pas été retenue. Pour toute question, écrivez à '
                      . ADMIN_EMAIL . '.</p>'));
            page_haut($ok ? 'Compte activé' : 'Demande refusée',
                $ok ? 'Le partenaire vient de recevoir son e-mail de connexion.'
                    : 'Le partenaire a été informé.');
            page_bas();
            exit;
        }

        /* demande d'invitations */
        $codes = [];
        store_update('demandes', function (array &$rows) use ($cible, $ok, &$codes) {
            foreach ($rows as &$r) {
                if ($r['id'] === $cible['id']) {
                    $r['statut'] = $ok ? 'valide' : 'refuse';
                    $r['jeton']  = '';
                    $r['decide'] = now();
                    if ($ok) {
                        foreach ($r['invites'] as &$g) {
                            if (empty($g['cle'])) $g['cle'] = token(12);
                            $codes[] = $g;
                        }
                        unset($g);
                    }
                }
            }
        });

        if ($ok) {
            $recap = '';
            foreach ($codes as $g) {
                $lien = base_url() . '?a=inv&k=' . $g['cle'];
                send_mail($g['email'], 'Votre invitation — ' . $cible['affiche'],
                    mail_wrap('Votre invitation à La Loge Corse',
                        '<p>Bonjour ' . h($g['prenom']) . ',</p>'
                        . '<p><strong>' . h($cible['societe']) . '</strong> vous invite dans la loge de ' . SITE_NAME
                        . ' au Stade Jean-Bouin pour <strong>' . h($cible['affiche']) . '</strong>.</p>'
                        . '<p>Votre invitation est nominative. Présentez-la à l’entrée, sur votre téléphone ou imprimée.</p>'
                        . bouton($lien, 'Ouvrir mon invitation', '#54C7EE')
                        . '<p>Code d’accès : <strong style="letter-spacing:.15em">' . h($g['code']) . '</strong></p>'));
                $recap .= '<li><strong>' . h($g['prenom'] . ' ' . $g['nom']) . '</strong> — '
                        . '<a href="' . h($lien) . '">invitation</a> — code ' . h($g['code']) . '</li>';
            }
            send_mail($cible['email'], 'Vos invitations sont validées — ' . $cible['affiche'],
                mail_wrap('Invitations validées',
                    '<p>Bonjour ' . h($cible['referent']) . ',</p>'
                    . '<p>' . ADMIN_NAME . ' a validé votre demande pour <strong>' . h($cible['affiche'])
                    . '</strong>. Chaque invité vient de recevoir son invitation nominative.</p>'
                    . '<p>Copie de vos invitations :</p><ul>' . $recap . '</ul>'));
        } else {
            send_mail($cible['email'], 'Votre demande d’invitations — ' . $cible['affiche'],
                mail_wrap('Demande non retenue',
                    '<p>Bonjour ' . h($cible['referent']) . ',</p>'
                    . '<p>Votre demande pour <strong>' . h($cible['affiche']) . '</strong> n’a pas pu être retenue. '
                    . 'Pour en discuter, écrivez à ' . ADMIN_EMAIL . '.</p>'));
        }

        page_haut($ok ? 'Invitations envoyées' : 'Demande refusée',
            $ok ? 'Les invitations nominatives viennent de partir vers les invités, avec copie au partenaire.'
                : 'Le partenaire a été informé.');
        page_bas();
        exit;
    }

    /* écran de décision */
    if ($type === 'compte') {
        page_haut('Valider un compte partenaire', 'Vérifiez les informations avant d’ouvrir l’accès.');
        echo '<div class="card"><h2>' . h($cible['societe']) . '</h2><table>'
           . '<tr><th>Référent</th><td>' . h($cible['referent']) . '</td></tr>'
           . '<tr><th>E-mail</th><td>' . h($cible['email']) . '</td></tr>'
           . '<tr><th>Téléphone</th><td>' . h($cible['tel']) . '</td></tr>'
           . '<tr><th>Identifiant</th><td>' . h($cible['login']) . '</td></tr>'
           . '<tr><th>Demandé le</th><td>' . h(date('d/m/Y à H:i', strtotime($cible['cree']))) . '</td></tr>'
           . '</table></div>';
    } else {
        page_haut('Valider des invitations', 'Après validation, les invitations nominatives partent automatiquement.');
        echo '<div class="card"><h2>' . h($cible['societe']) . '</h2><table>'
           . '<tr><th>Affiche</th><td>' . h($cible['affiche']) . '</td></tr>'
           . '<tr><th>Demandé par</th><td>' . h($cible['referent']) . ' — ' . h($cible['email']) . '</td></tr>'
           . '</table><h2 style="margin-top:22px">Invités</h2><table>';
        foreach ($cible['invites'] as $g) {
            echo '<tr><td><strong>' . h($g['prenom'] . ' ' . $g['nom']) . '</strong></td>'
               . '<td>' . h($g['email']) . '</td><td>' . h($g['tel']) . '</td></tr>';
        }
        echo '</table>';
        if (($cible['message'] ?? '') !== '') {
            echo '<p class="help">Message du partenaire : ' . nl2br(h($cible['message'])) . '</p>';
        }
        echo '</div>';
    }
    echo '<form method="post" action="?a=admin">'
       . '<input type="hidden" name="t" value="' . h($t) . '">'
       . '<div class="actions">'
       . '<button class="btn btn-sky" name="decision" value="oui" type="submit">Valider</button>'
       . '<button class="btn btn-coral" name="decision" value="non" type="submit">Refuser</button>'
       . '</div></form>'
       . '<p class="help">Ce lien ne fonctionne qu’une fois : une fois la décision prise, il est désactivé.</p>';
    page_bas();
    exit;
}

/* ---- invitation nominative ---- */
if ($action === 'inv') {
    $k = (string)($_GET['k'] ?? '');
    $found = null;
    foreach (store_read('demandes') as $d) {
        if (($d['statut'] ?? '') !== 'valide') continue;
        foreach ($d['invites'] as $g) {
            if (!empty($g['cle']) && hash_equals((string)$g['cle'], $k)) {
                $found = ['d' => $d, 'g' => $g];
                break 2;
            }
        }
    }
    if (!$found) {
        page_haut('Invitation introuvable', 'Ce lien n’est pas valide. Rapprochez-vous du partenaire qui vous a invité.');
        page_bas();
        exit;
    }
    $d = $found['d']; $g = $found['g'];
    page_haut('Votre invitation');
    echo '<div class="inv">'
       . '<div class="inv-top"><span class="eyebrow">Paris FC · Stade Jean-Bouin</span>'
       . '<h2>' . h($g['prenom'] . ' ' . $g['nom']) . '</h2></div>'
       . '<div class="inv-body">'
       . '<div class="inv-row"><span class="k">Affiche</span><span class="v">' . h($d['affiche']) . '</span></div>'
       . '<div class="inv-row"><span class="k">Invité par</span><span class="v">' . h($d['societe']) . '</span></div>'
       . '<div class="inv-row"><span class="k">Accès</span><span class="v">La Loge Corse — Porte A</span></div>'
       . '<div class="code">' . h($g['code']) . '</div>'
       . '<p class="help" style="text-align:center">Code d’accès à présenter à l’entrée</p>'
       . '<div id="qr" data-code="' . h($g['code']) . '"></div>'
       . '<div class="actions no-print" style="justify-content:center">'
       . '<button class="btn btn-ghost" onclick="window.print()" type="button">Imprimer</button></div>'
       . '</div></div>'
       . '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>'
       . '<script>(function(){var e=document.getElementById("qr");'
       . 'if(window.QRCode&&e){try{new QRCode(e,{text:e.getAttribute("data-code"),width:168,height:168,'
       . 'colorDark:"#071F4B",colorLight:"#ffffff"});}catch(x){}}})();</script>';
    page_bas();
    exit;
}

/* ---- formulaire d'inscription ---- */
if ($action === 'register') {
    page_haut('Créer mon accès partenaire',
        'Choisissez votre société, votre identifiant et votre mot de passe. '
        . ADMIN_NAME . ' active ensuite votre compte.');
    if ($erreur !== '') echo '<div class="msg msg-err">' . h($erreur) . '</div>';
    echo '<form method="post" action="?a=register" class="card">' . csrf_field()
       . '<div class="grid">'
       . '<label class="span">Votre société <span class="req">*</span><select name="societe" required>'
       . '<option value="">— Choisissez —</option>';
    foreach (societes() as $s) {
        $sel = (($_POST['societe'] ?? '') === $s) ? ' selected' : '';
        echo '<option' . $sel . '>' . h($s) . '</option>';
    }
    echo '</select></label>'
       . '<label>Vos nom et prénom <span class="req">*</span><input name="referent" required value="' . h($_POST['referent'] ?? '') . '"></label>'
       . '<label>Votre e-mail <span class="req">*</span><input type="email" name="email" required value="' . h($_POST['email'] ?? '') . '"></label>'
       . '<label>Votre téléphone <span class="req">*</span><input type="tel" name="tel" required value="' . h($_POST['tel'] ?? '') . '"></label>'
       . '<label>Identifiant <span class="req">*</span><input name="login" required pattern="[A-Za-z0-9._-]{3,32}" value="' . h($_POST['login'] ?? '') . '"></label>'
       . '<label>Mot de passe <span class="req">*</span><input type="password" name="mdp" required minlength="10" autocomplete="new-password"></label>'
       . '<label>Confirmer le mot de passe <span class="req">*</span><input type="password" name="mdp2" required minlength="10" autocomplete="new-password"></label>'
       . '</div>'
       . '<p class="help">Au moins 10 caractères. Votre mot de passe n’est jamais visible : il est stocké chiffré et '
       . ADMIN_NAME . ' lui-même ne peut pas le lire.</p>'
       . '<div class="actions"><button class="btn btn-sky" type="submit">Créer mon accès</button>'
       . '<a class="btn btn-ghost" href="' . h(base_url()) . '">J’ai déjà un compte</a></div>'
       . '</form>';
    page_bas();
    exit;
}

if ($action === 'done') {
    page_haut('Demande envoyée');
    echo '<div class="msg msg-ok">' . h($succes) . '</div>'
       . '<div class="actions"><a class="btn btn-ghost" href="/">Retour au site</a></div>';
    page_bas();
    exit;
}

/* ---- espace connecté / connexion ---- */
$moi = partenaire_courant();

if (!$moi) {
    page_haut('Espace partenaire', 'Réservé aux sociétés partenaires de ' . SITE_NAME . '.');
    if ($erreur !== '') echo '<div class="msg msg-err">' . h($erreur) . '</div>';
    echo '<form method="post" action="' . h(base_url()) . '" class="card">' . csrf_field()
       . '<div class="grid">'
       . '<label>Identifiant <span class="req">*</span><input name="login" required autocomplete="username"></label>'
       . '<label>Mot de passe <span class="req">*</span><input type="password" name="mdp" required autocomplete="current-password"></label>'
       . '</div>'
       . '<div class="actions"><button class="btn btn-sky" type="submit">Se connecter</button>'
       . '<a class="btn btn-ghost" href="?a=register">Créer mon accès</a></div>'
       . '</form>';
    page_bas();
    exit;
}

/* tableau de bord */
$mesDemandes = [];
foreach (store_read('demandes') as $d) {
    if ($d['partenaire'] === $moi['id']) $mesDemandes[] = $d;
}
$mesDemandes = array_reverse($mesDemandes);

page_haut('Bonjour ' . $moi['referent'], h($moi['societe']) . ' — jusqu’à ' . MAX_GUESTS . ' invités par affiche.');
if ($erreur !== '') echo '<div class="msg msg-err">' . h($erreur) . '</div>';
if ($succes !== '') echo '<div class="msg msg-ok">' . h($succes) . '</div>';

echo '<form method="post" action="?a=new" class="card">' . csrf_field()
   . '<h2>Nouvelle demande d’invitations</h2>'
   . '<div class="grid"><label class="span">Affiche souhaitée <span class="req">*</span>'
   . '<select name="affiche" required><option value="">— Choisissez une affiche —</option>';
foreach (affiches() as $i => $a) {
    echo '<option value="' . $i . '">' . h(libelle_affiche($a)) . '</option>';
}
echo '</select></label></div>';
for ($i = 1; $i <= MAX_GUESTS; $i++) {
    echo '<div class="guest"><h3>Invité ' . $i . ($i > 1 ? ' (facultatif)' : '') . '</h3><div class="grid">'
       . '<label>Nom' . ($i === 1 ? ' <span class="req">*</span>' : '') . '<input name="nom' . $i . '"' . ($i === 1 ? ' required' : '') . ' autocomplete="off"></label>'
       . '<label>Prénom' . ($i === 1 ? ' <span class="req">*</span>' : '') . '<input name="prenom' . $i . '"' . ($i === 1 ? ' required' : '') . ' autocomplete="off"></label>'
       . '<label>E-mail' . ($i === 1 ? ' <span class="req">*</span>' : '') . '<input type="email" name="email' . $i . '"' . ($i === 1 ? ' required' : '') . ' autocomplete="off"></label>'
       . '<label>Téléphone' . ($i === 1 ? ' <span class="req">*</span>' : '') . '<input type="tel" name="tel' . $i . '"' . ($i === 1 ? ' required' : '') . ' autocomplete="off"></label>'
       . '</div></div>';
}
echo '<label class="span">Message pour ' . ADMIN_NAME . ' (facultatif)<textarea name="message" rows="3"></textarea></label>'
   . '<p class="help">Chaque invité renseigné doit avoir ses quatre informations. Laissez vides les blocs inutilisés.</p>'
   . '<div class="actions"><button class="btn btn-sky" type="submit">Envoyer pour validation</button></div>'
   . '</form>';

echo '<div class="card"><h2>Mes demandes</h2>';
if (!$mesDemandes) {
    echo '<p class="help">Aucune demande pour le moment.</p>';
} else {
    echo '<table><tr><th>Affiche</th><th>Invités</th><th>Statut</th></tr>';
    foreach ($mesDemandes as $d) {
        $st = $d['statut'] ?? 'attente';
        $cl = $st === 'valide' ? 't-ok' : ($st === 'refuse' ? 't-no' : 't-att');
        $lb = $st === 'valide' ? 'Validée' : ($st === 'refuse' ? 'Refusée' : 'En attente');
        $noms = [];
        foreach ($d['invites'] as $g) $noms[] = $g['prenom'] . ' ' . $g['nom'];
        echo '<tr><td>' . h($d['affiche']) . '</td><td>' . h(implode(', ', $noms)) . '</td>'
           . '<td><span class="tag ' . $cl . '">' . $lb . '</span></td></tr>';
    }
    echo '</table>';
}
echo '</div>';
page_bas();
