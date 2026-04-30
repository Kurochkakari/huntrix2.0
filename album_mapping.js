// Album and Version ID Mapping based on huntrix.sql
// This file contains the correct album_id and version_id values from the database

const ALBUM_IDS = {
    // Female groups
    'aespa-armageddon': 103,
    'aespa-drama': 104,
    'aespa-girls': 105,
    'katseye-sis': 106,
    'katseye-beautiful-chaos': 107,
    'redvelvet-queendom': 108,
    'redvelvet-feel-my-rhythm': 109,
    'redvelvet-like-a-flower': 110,
    'babymonster-drip': 111,
    'babymonster-drip-zip': 112,
    'babymons7er-1st-mini': 113,
    'illit-ill-like-you': 114,
    'illit-bomb': 115,
    'illit-super-real-me': 116,
    'kiss-of-life-midas-touch': 117,
    'kiss-of-life-lose-yourself': 118,
    'kiss-of-life-kiss-of-life': 119,
    'ive-ive-empathy': 120,
    'ive-ive-secret': 121,
    'ive-ive-switch': 122,
    'twice-strategy': 123,
    'twice-ten-story': 124,
    'twice-between-1-2': 125,
    'lesserafim-spaghetti': 126,
    'lesserafim-crazy': 127,
    'lesserafim-hot': 128,
    'kep1er-kep1going-on': 129,
    'kep1er-bubble-gum': 130,
    'kep1er-magic-hour': 131,
    'itzy-girls-will-be-girls': 132,
    'itzy-air': 133,
    'itzy-born-to-be': 134,
    'dreamcatcher-uau': 135,
    'dreamcatcher-villains': 136,
    'dreamcatcher-virtuous': 137,
    
    // Male groups
    'zb1-melting-point': 138,
    'zb1-cinema-paradise': 139,
    'zb1-blue-paradise': 140,
    'p1harmony-sad-song': 173,
    'p1harmony-killin-it': 174,
    'p1harmony-harmony-set-in': 175,
    'txt-eternity': 146,
    'txt-magic': 144,
    'txt-blue-hour': 145,
    'bts-school-luv-affair': 147,
    'bts-dark-wild': 148,
    'bts-orul8-2': 149,
    'enhypen-romance': 150,
    'enhypen-orange-blood': 151,
    'enhypen-dimension-answer': 152,
    'ateez-to-the-end-dvd': 153,
    'ateez-to-the-end-play-code': 154,
    'ateez-will': 155,
    'seventeen-an-ode': 156,
    'seventeen-10th-mini': 157,
    'seventeen-beam': 158,
    'straykids-5-star': 159,
    'straykids-hiptape': 160,
    'straykids-karma': 161,
    'oneus-5x': 162,
    'oneus-pygmalion': 163,
    'oneus-malus': 164,
    'boynextdoor-4th-ep': 165,
    'boynextdoor-why': 166,
    'boynextdoor-1st-ep': 167,
    'xlov-i-one': 168,
    'xlov-imma-be': 169,
    'riize-get-a-guitar': 170,
    'riize-odyssey': 171,
    'riize-odyssey-2': 172
};

const VERSION_IDS = {
    // album_id 103 - Aespa Armageddon (versions: KARINA, WINTER, GISELLE, NINGNING)
    'ver.1-103': 54,
    'ver.2-103': 55,
    'ver.3-103': 56,
    'ver.4-103': 57,
    
    // album_id 105 - Aespa Girls (versions: KWANGYA, Real world)
    'ver.1-105': 58,
    'ver.2-105': 59,
    
    // album_id 106 - KATSEYE SIS (versions: SOFT, STRONG)
    'ver.1-106': 50,
    'ver.2-106': 51,
    
    // album_id 107 - KATSEYE BEAUTIFUL CHAOS (versions: CHAOTIC, BEAUTIFUL)
    'ver.1-107': 52,
    'ver.2-107': 53,
    
    // album_id 109 - Red Velvet Feel My Rhythm (versions: CALMATO, CAPRICCIOSO)
    'ver.1-109': 60,
    'ver.2-109': 61,
    
    // album_id 114 - ILLIT I'LL LIKE YOU (versions: WITH, TO, BETWEEN)
    'ver.1-114': 62,
    'ver.2-114': 63,
    'ver.3-114': 64,
    
    // album_id 115 - ILLIT Bomb (versions: PINK BOMB, MAGIC BOMB, STAR BOMB)
    'ver.1-115': 65,
    'ver.2-115': 66,
    'ver.3-115': 67,
    
    // album_id 116 - ILLIT SUPER REAL ME (versions: SUPER ME, REAL ME)
    'ver.1-116': 68,
    'ver.2-116': 69,
    
    // album_id 120 - IVE IVE EMPATHY (versions: AND US, ME, YOU)
    'ver.1-120': 70,
    'ver.2-120': 71,
    'ver.3-120': 72,
    
    // album_id 121 - IVE IVE SECRET (versions: Psst!, Shh!, Gasp!)
    'ver.1-121': 73,
    'ver.2-121': 74,
    'ver.3-121': 75,
    
    // album_id 122 - IVE IVE SWITCH (versions: ON, OFF, SPIN-OFF, LOVED IVE)
    'ver.1-122': 76,
    'ver.2-122': 77,
    'ver.3-122': 78,
    'ver.4-122': 79,
    
    // album_id 125 - TWICE BETWEEN 1&2 (versions: COMPLETE, CRYPTOGRAPHY, PATHFINDER, ARCHIVE)
    'ver.1-125': 80,
    'ver.2-125': 81,
    'ver.3-125': 82,
    'ver.4-125': 83,
    
    // album_id 126 - LE SSERAFIM SPAGHETTI (versions: CREMA SILVER, SALSA PINK, PESTO GREEN, ALFREDO BLUE, RAGU RED, BÉCHAMEL WHITE)
    'ver.1-126': 84,
    'ver.2-126': 85,
    'ver.3-126': 86,
    'ver.4-126': 87,
    'ver.5-126': 88,
    'ver.6-126': 89,
    
    // album_id 127 - LE SSERAFIM CRAZY (versions: BLACK, WHITE, BLUE)
    'ver.1-127': 90,
    'ver.2-127': 91,
    'ver.3-127': 92,
    
    // album_id 128 - LE SSERAFIM HOT (versions: DRENCHED VETIVER, BLEACHED AURA, HOT)
    'ver.1-128': 93,
    'ver.2-128': 94,
    'ver.3-128': 95,
    
    // album_id 129 - Kep1er Kep1going On (versions: SKENE, NOUS)
    'ver.1-129': 96,
    'ver.2-129': 97,
    
    // album_id 130 - Kep1er BUBBLE GUM (no versions? Actually album_versions has for 131? Wait 131 is Kep1er Magic Hour versions: Sunkissed, Moonlighted, Beloved)
    // Actually album_id 131 has versions:
    'ver.1-131': 98,
    'ver.2-131': 99,
    'ver.3-131': 100,
    
    // album_id 135 - DREAMCATCHER UAU (versions: P, L)
    'ver.1-135': 101,
    'ver.2-135': 102,
    
    // ZB1 versions
    // album_id 140 - ZB1 MELTING POINT (versions: Fairytale, Loyalty, Mystery)
    'ver.1-140': 1,
    'ver.2-140': 2,
    'ver.3-140': 3,
    
    // album_id 139 - ZB1 CINEMA PARADISE (versions: ROMANCE, SF)
    'ver.1-139': 4,
    'ver.2-139': 5,
    
    // album_id 138 - ZB1 BLUE PARADISE (versions: SEEK, HIDE)
    'ver.1-138': 6,
    'ver.2-138': 7,
    
    // P1Harmony
    // album_id 173 - P1H Sad Song (versions: SAD SONG, HARMONY, MELODY)
    'ver.1-173': 8,
    'ver.2-173': 9,
    'ver.3-173': 10,
    
    // album_id 174 - P1H Killin' It (versions: Killin' It, Superb)
    'ver.1-174': 11,
    'ver.2-174': 12,
    
    // album_id 175 - P1H Harmony : Set In (versions: Set in, Step in, Grow in)
    'ver.1-175': 13,
    'ver.2-175': 14,
    'ver.3-175': 15,
    
    // TXT
    // album_id 146 - TXT ETERNITY (versions: Port, Starboard)
    'ver.1-146': 16,
    'ver.2-146': 17,
    
    // album_id 144 - TXT MAGIC (versions: Sanctuary, Arcadia)
    'ver.1-144': 18,
    'ver.2-144': 19,
    
    // album_id 145 - TXT BLUE HOUR (versions: R, VR, AR)
    'ver.1-145': 20,
    'ver.2-145': 21,
    'ver.3-145': 22,
    
    // ENHYPEN
    // album_id 150 - ENHYPEN ROMANCE (versions: Blue Noon, White Midnight)
    'ver.1-150': 23,
    'ver.2-150': 24,
    
    // album_id 151 - ENHYPEN ORANGE BLOOD (versions: KSANA, KALPA)
    'ver.1-151': 25,
    'ver.2-151': 26,
    
    // album_id 152 - ENHYPEN DIMENSION ANSWER (versions: NO, YET)
    'ver.1-152': 27,
    'ver.2-152': 28,
    
    // SEVENTEEN
    // album_id 156 - SEVENTEEN An Ode (versions: Begin, The Poet, Hope, Truth, Real)
    'ver.1-156': 29,
    'ver.2-156': 30,
    'ver.3-156': 31,
    'ver.4-156': 32,
    'ver.5-156': 33,
    
    // album_id 157 - SEVENTEEN 10th Mini (versions: Faded Mono Life, Fallen Misfit Lost, Fight for My Life)
    'ver.1-157': 34,
    'ver.2-157': 35,
    'ver.3-157': 36,
    
    // album_id 158 - SEVENTEEN BEAM (versions: X, +)
    'ver.1-158': 37,
    'ver.2-158': 38,
    
    // Stray Kids
    // album_id 159 - Stray Kids 5-STAR (versions: A, B, C)
    'ver.1-159': 39,
    'ver.2-159': 40,
    'ver.3-159': 41,
    
    // album_id 161 - Stray Kids KARMA (versions: Белая, Синяя)
    'ver.1-161': 42,
    'ver.2-161': 43,
    
    // BOYNEXTDOOR
    // album_id 167 - BOYNEXTDOOR 1st EP (versions: DAZED, MOODY)
    'ver.1-167': 44,
    'ver.2-167': 45,
    
    // RIIZE
    // album_id 170 - RIIZE Get A Guitar (versions: Realize, Rise)
    'ver.1-170': 46,
    'ver.2-170': 47,
    
    // album_id 171 - RIIZE ODYSSEY (versions: Earth, Universe)
    'ver.1-171': 48,
    'ver.2-171': 49
};

// Helper function to get album_id
function getAlbumId(albumKey) {
    return ALBUM_IDS[albumKey] || null;
}

// Helper function to get version_id
function getVersionId(versionKey, albumId) {
    return VERSION_IDS[versionKey + '-' + albumId] || null;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ALBUM_IDS, VERSION_IDS, getAlbumId, getVersionId };
}
