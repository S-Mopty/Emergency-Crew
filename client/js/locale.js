let LANG = (navigator.language || 'fr').slice(0, 2) === 'en' ? 'en' : 'fr';

const STRINGS = {
  // Menu - main
  title:           { fr: 'EMERGENCY CREW', en: 'EMERGENCY CREW' },
  subtitle:        { fr: 'SURVIE COOPERATIVE', en: 'COOPERATIVE SURVIVAL' },
  title_sub:       { fr: 'SURVIE COOPERATIVE', en: 'COOPERATIVE SURVIVAL' },
  menu_tagline:    { fr: 'Reparez. Survivez. Trahissez.', en: 'Repair. Survive. Betray.' },
  title_tagline:   { fr: 'Reparez. Survivez. Trahissez.', en: 'Repair. Survive. Betray.' },
  version:         { fr: 'v0.1 - Prototype', en: 'v0.1 - Prototype' },
  btn_create:      { fr: 'CREER UNE PARTIE', en: 'CREATE GAME' },
  btn_join:        { fr: 'REJOINDRE', en: 'JOIN GAME' },
  btn_start:       { fr: 'LANCER LA PARTIE', en: 'START GAME' },
  btn_back:        { fr: 'RETOUR', en: 'BACK' },
  // Menu - join
  join_title:      { fr: 'REJOINDRE', en: 'JOIN GAME' },
  join_subtitle:   { fr: 'Entrez le code de la salle', en: 'Enter the room code' },
  join_placeholder:{ fr: 'Code salle...', en: 'Room code...' },
  btn_join_confirm:{ fr: 'REJOINDRE', en: 'JOIN' },
  join_error_empty:{ fr: 'Entrez un code de salle', en: 'Enter a room code' },
  join_error_fail: { fr: 'Impossible de rejoindre cette salle', en: 'Could not join this room' },
  create_error:    { fr: 'Impossible de creer la salle', en: 'Could not create room' },
  // Menu - lobby
  lobby_title:     { fr: 'SALLE D\'ATTENTE', en: 'LOBBY' },
  lobby_hint:      { fr: 'Partagez le code avec vos amis', en: 'Share the code with friends' },
  lobby_code_prefix:{ fr: 'Code:', en: 'Code:' },
  lobby_copied:    { fr: 'Copie !', en: 'Copied!' },
  lobby_players:   { fr: 'Joueurs: ', en: 'Players: ' },
  lobby_max:       { fr: '/4', en: '/4' },
  lobby_slot_empty:{ fr: '- vide -', en: '- empty -' },
  lobby_you:       { fr: 'VOUS', en: 'YOU' },
  lobby_need_players:{ fr: 'Il faut au moins 2 joueurs', en: 'Need at least 2 players' },
  lobby_waiting_host:{ fr: 'En attente du lancement...', en: 'Waiting for host to start...' },
  lobby_disconnected:{ fr: 'Deconnecte du serveur', en: 'Disconnected from server' },
  // Legacy aliases
  waiting_host:    { fr: 'En attente du lancement par l\'hote...', en: 'Waiting for host to start...' },
  you:             { fr: 'VOUS', en: 'YOU' },
  empty:           { fr: '- vide -', en: '- empty -' },
  players_count:   { fr: 'Joueurs', en: 'Players' },
  room_code:       { fr: 'Code', en: 'Code' },
  // HUD labels
  hud_time:            { fr: 'TEMPS', en: 'TIME' },
  hud_time_label:      { fr: 'TEMPS', en: 'TIME' },
  hud_stability:       { fr: 'STABILITE', en: 'STABILITY' },
  hud_stability_label: { fr: 'STABILITE', en: 'STABILITY' },
  hud_score:           { fr: 'SCORE', en: 'SCORE' },
  hud_score_label:     { fr: 'SCORE', en: 'SCORE' },
  hud_item:            { fr: 'Objet', en: 'Item' },
  hud_item_none:       { fr: 'Objet: aucun', en: 'Item: none' },
  hud_item_prefix:     { fr: 'Objet:', en: 'Item:' },
  hud_none:            { fr: 'aucun', en: 'none' },
  hud_controls:        { fr: 'ZQSD:Bouger E:Ramasser ESPACE:Frapper MAJ:Dash Maintenir R:Reparer', en: 'WASD:Move E:Pick up SPACE:Hit SHIFT:Dash Hold R:Repair' },
  hud_repair:          { fr: 'Reparer', en: 'Repair' },
  hud_hold_r:          { fr: 'Maintenir R', en: 'Hold R' },
  hud_drop:            { fr: 'Lacher', en: 'Drop' },
  hud_waiting:         { fr: 'En attente...', en: 'Waiting...' },
  hud_disconnect:      { fr: 'Connexion perdue...', en: 'Connection lost...' },
  controls_layout:     { fr: 'zqsd', en: 'wasd' },
  machine_required:    { fr: 'Besoin:', en: 'Needs:' },
  machine_broken:      { fr: 'En panne !', en: 'Broken!' },
  // End screen
  end_station_saved:     { fr: 'STATION SAUVEE !', en: 'STATION SAVED!' },
  end_station_destroyed: { fr: 'STATION DETRUITE...', en: 'STATION DESTROYED...' },
  end_stability:         { fr: 'Stabilite finale:', en: 'Final stability:' },
  end_employee:          { fr: 'EMPLOYE DU MOIS', en: 'EMPLOYEE OF THE MONTH' },
  end_ranking:           { fr: 'CLASSEMENT FINAL', en: 'FINAL RANKING' },
  end_replay:            { fr: 'RETOUR AU MENU', en: 'BACK TO MENU' },
  end_saboteur:          { fr: 'LE SABOTEUR', en: 'THE SABOTEUR' },
  end_intern:            { fr: 'LE STAGIAIRE', en: 'THE INTERN' },
};

const ITEMS = {
  welding_kit: { fr: 'Kit Soudure', en: 'Welding Kit' },
  fuse:        { fr: 'Fusible', en: 'Fuse' },
  coolant:     { fr: 'Refrigerant', en: 'Coolant' },
};

const MACHINES = {
  gas_leak:       { fr: 'Fuite de gaz', en: 'Gas Leak' },
  short_circuit:  { fr: 'Court-circuit', en: 'Short Circuit' },
  overheat:       { fr: 'Surchauffe', en: 'Overheat' },
};

const EMERGENCIES = {
  gas_leak:       { fr: 'FUITE DE GAZ', en: 'GAS LEAK' },
  short_circuit:  { fr: 'COURT-CIRCUIT', en: 'SHORT CIRCUIT' },
  overheat:       { fr: 'SURCHAUFFE', en: 'OVERHEAT' },
};

const ROOMS = {
  storage:     { fr: 'STOCKAGE', en: 'STORAGE' },
  reactor:     { fr: 'REACTEUR', en: 'REACTOR' },
  hub:         { fr: 'HUB CENTRAL', en: 'CENTRAL HUB' },
  medical:     { fr: 'INFIRMERIE', en: 'MEDICAL BAY' },
  electrical:  { fr: 'ELECTRIQUE', en: 'ELECTRICAL' },
  command:     { fr: 'PASSERELLE', en: 'COMMAND BRIDGE' },
  armory:      { fr: 'ARMURERIE', en: 'ARMORY' },
  engine:      { fr: 'SALLE MACHINES', en: 'ENGINE ROOM' },
  lifesupport: { fr: 'SUPPORT VIE', en: 'LIFE SUPPORT' },
};

const COLORS = {
  0: { fr: 'BLEU', en: 'BLUE' },
  1: { fr: 'ROUGE', en: 'RED' },
  2: { fr: 'VERT', en: 'GREEN' },
  3: { fr: 'ORANGE', en: 'ORANGE' },
};

export function getLang() { return LANG; }
export function setLang(l) { LANG = l; }
export function t(key) { return STRINGS[key]?.[LANG] || key; }
export function t_item(key) { return ITEMS[key]?.[LANG] || key; }
export function t_machine(key) { return MACHINES[key]?.[LANG] || key; }
export function t_emergency(key) { return EMERGENCIES[key]?.[LANG] || key; }
export function t_room(key) { return ROOMS[key]?.[LANG] || key; }
export function t_color(idx) { return COLORS[idx]?.[LANG] || '???'; }
