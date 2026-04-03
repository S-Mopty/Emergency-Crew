// ============================================================
//  Emergency Crew - Localization (EN/FR)
//  Merged from version_Arthur (S-Mopty/Emergency-Crew)
// ============================================================

let _lang = (navigator.language || 'fr').substring(0, 2) === 'en' ? 'en' : 'fr';

export function getLang() { return _lang; }
export function setLang(l) { _lang = l === 'en' ? 'en' : 'fr'; }

const STRINGS = {
  title:           { fr: 'EMERGENCY CREW', en: 'EMERGENCY CREW' },
  subtitle:        { fr: 'Survie Cooperative', en: 'Cooperative Survival' },
  create:          { fr: 'CREER UNE PARTIE', en: 'CREATE GAME' },
  join:            { fr: 'REJOINDRE', en: 'JOIN' },
  join_title:      { fr: 'REJOINDRE UNE PARTIE', en: 'JOIN A GAME' },
  room_code:       { fr: 'Code salle', en: 'Room code' },
  room_hint:       { fr: 'Partagez le code pour inviter des joueurs', en: 'Share the code to invite players' },
  validate:        { fr: 'VALIDER', en: 'CONFIRM' },
  cancel:          { fr: 'ANNULER', en: 'CANCEL' },
  copy:            { fr: 'COPIER', en: 'COPY' },
  copied:          { fr: 'Copie !', en: 'Copied!' },
  quit:            { fr: 'QUITTER', en: 'QUIT' },
  waiting_room:    { fr: "SALLE D'ATTENTE", en: 'WAITING ROOM' },
  players:         { fr: 'Joueurs', en: 'Players' },
  start:           { fr: 'LANCER LA PARTIE', en: 'START GAME' },
  ready:           { fr: 'PRET', en: 'READY' },
  not_ready:       { fr: 'PAS PRET', en: 'NOT READY' },
  waiting_host:    { fr: "En attente de l'hote...", en: 'Waiting for host...' },
  need_2:          { fr: 'Min. 2 joueurs', en: 'Min. 2 players' },
  all_ready:       { fr: 'Tout le monde doit etre pret', en: 'Everyone must be ready' },
  connecting:      { fr: 'Connexion au serveur...', en: 'Connecting to server...' },
  connect_fail:    { fr: 'Connexion echouee. Reessayez.', en: 'Connection failed. Try again.' },
  join_fail:       { fr: 'Impossible de rejoindre. Verifiez le code.', en: 'Cannot join. Check the code.' },
  disconnected:    { fr: 'DECONNECTE', en: 'DISCONNECTED' },
  back_menu:       { fr: 'Retour au menu...', en: 'Back to menu...' },
  time:            { fr: 'TEMPS', en: 'TIME' },
  stability:       { fr: 'STABILITE', en: 'STABILITY' },
  score:           { fr: 'SCORE', en: 'SCORE' },
  item_none:       { fr: 'Objet : aucun', en: 'Item: none' },
  item_carry:      { fr: 'Objet :', en: 'Item:' },
  controls:        { fr: 'ZQSD:Bouger  MAJ:Courir  F:Dash  E:Ramasser  ESPACE:Frapper  R:Reparer', en: 'WASD:Move  SHIFT:Run  F:Dash  E:Pickup  SPACE:Attack  R:Repair' },
  station_saved:   { fr: 'STATION SAUVEE !', en: 'STATION SAVED!' },
  station_lost:    { fr: 'STATION DETRUITE...', en: 'STATION DESTROYED...' },
  final_stab:      { fr: 'Stabilite finale :', en: 'Final stability:' },
  ranking:         { fr: 'CLASSEMENT FINAL', en: 'FINAL RANKING' },
  replay:          { fr: 'REJOUER', en: 'PLAY AGAIN' },
  employee:        { fr: 'EMPLOYE DU MOIS', en: 'EMPLOYEE OF THE MONTH' },
  saboteur:        { fr: 'LE SABOTEUR', en: 'THE SABOTEUR' },
  intern:          { fr: 'LE STAGIAIRE', en: 'THE INTERN' },
  tutorial:        { fr: 'TUTORIEL', en: 'TUTORIAL' },
  understood:      { fr: 'COMPRIS !', en: 'GOT IT!' },
  waiting_players: { fr: 'joueurs prets', en: 'players ready' },
  customize:       { fr: 'PERSONNALISER', en: 'CUSTOMIZE' },
  customize_title: { fr: 'PERSONNALISATION', en: 'CUSTOMIZATION' },
  nickname:        { fr: 'Pseudo', en: 'Nickname' },
  hat:             { fr: 'Chapeau', en: 'Hat' },
  accessory:       { fr: 'Accessoire', en: 'Accessory' },
  validate_custom: { fr: 'VALIDER', en: 'CONFIRM' },
  empty_slot:      { fr: '- vide -', en: '- empty -' },
  broken:          { fr: 'EN PANNE', en: 'BROKEN' },
  ok:              { fr: 'OK', en: 'OK' },
  need:            { fr: 'Besoin:', en: 'Need:' },
  overheat_warn:   { fr: 'SURCHAUFFE:', en: 'OVERHEAT:' },
};

const ITEMS = {
  welding_kit: { fr: 'Kit Soudure', en: 'Welding Kit' },
  fuse:        { fr: 'Fusible', en: 'Fuse' },
  coolant:     { fr: 'Refrigerant', en: 'Coolant' },
};

const MACHINES = {
  gas_leak:      { fr: 'Vanne Gaz', en: 'Gas Valve' },
  short_circuit: { fr: 'Disjoncteur', en: 'Circuit Breaker' },
  overheat:      { fr: 'Refroidisseur', en: 'Cooling Unit' },
};

const EMERGENCIES = {
  gas_leak:      { fr: 'FUITE DE GAZ', en: 'GAS LEAK' },
  short_circuit: { fr: 'COURT-CIRCUIT', en: 'SHORT CIRCUIT' },
  overheat:      { fr: 'SURCHAUFFE', en: 'OVERHEAT' },
};

const ROOMS = {
  storage:    { fr: 'STOCKAGE', en: 'STORAGE' },
  command:    { fr: 'COMMANDEMENT', en: 'COMMAND' },
  reactor:    { fr: 'REACTEUR', en: 'REACTOR' },
  hub:        { fr: 'HUB CENTRAL', en: 'CENTRAL HUB' },
  medical:    { fr: 'INFIRMERIE', en: 'MEDICAL BAY' },
  electrical: { fr: 'ELECTRIQUE', en: 'ELECTRICAL' },
  armory:     { fr: 'ARMURERIE', en: 'ARMORY' },
  engine:     { fr: 'SALLE MACHINES', en: 'ENGINE ROOM' },
  life:       { fr: 'SURVIE', en: 'LIFE SUPPORT' },
};

const COLORS = {
  0: { fr: 'Bleu', en: 'Blue' },
  1: { fr: 'Rouge', en: 'Red' },
  2: { fr: 'Vert', en: 'Green' },
  3: { fr: 'Orange', en: 'Orange' },
};

export function t(key) { return (STRINGS[key] || {})[_lang] || key; }
export function t_item(key) { return (ITEMS[key] || {})[_lang] || key; }
export function t_machine(key) { return (MACHINES[key] || {})[_lang] || key; }
export function t_emergency(key) { return (EMERGENCIES[key] || {})[_lang] || key; }
export function t_room(key) { return (ROOMS[key] || {})[_lang] || key; }
export function t_color(idx) { return (COLORS[idx] || {})[_lang] || idx; }
