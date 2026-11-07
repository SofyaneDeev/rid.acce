/* =========================================================
   RID ACCE — starter catalogue
   Used when Supabase is not configured (or unreachable), and as the
   "Import starter catalogue" source in admin.html.
   Once Supabase is set up, manage products from admin.html instead.
   ⚠ Prices are PLACEHOLDERS in MAD — set your real prices.
   ========================================================= */
window.AURELE_SEED = [
  {
    "id": "cartier-baignoire",
    "brand": "Cartier",
    "name": {
      "en": "Baignoire",
      "fr": "Baignoire",
      "ar": "Baignoire"
    },
    "cat": "Watches",
    "gender": "women",
    "price": 89000,
    "img": "images/products/cartier-baignoire-gold.webp",
    "variants": [
      {
        "key": "gold",
        "name": {
          "en": "Yellow gold",
          "fr": "Or jaune",
          "ar": "ذهب أصفر"
        },
        "price": 89000,
        "imgs": [
          "images/products/cartier-baignoire-gold.webp",
          "images/products/cartier-baignoire-gold-2.webp"
        ],
        "swatch": "linear-gradient(135deg,#fff3c9,#e2b960 45%,#8f6a22)"
      },
      {
        "key": "twotone",
        "name": {
          "en": "Two-tone gold & steel",
          "fr": "Bicolore or & acier",
          "ar": "ثنائي اللون ذهب وفولاذ"
        },
        "price": 64000,
        "imgs": [
          "images/products/cartier-baignoire-two-tone.webp"
        ],
        "swatch": "linear-gradient(90deg,#d7d9dc 50%,#e2b960 50%)"
      }
    ],
    "chain": [],
    "sub": {
      "en": "Curved oval case · guilloché dial",
      "fr": "Boîtier ovale galbé · cadran guilloché",
      "ar": "علبة بيضاوية منحنية · ميناء منقوش"
    },
    "description": {
      "en": "The famous curved oval case, a silvered guilloché dial with Roman numerals and a fluid link bracelet. A quiet icon of feminine watchmaking.",
      "fr": "Le célèbre boîtier ovale galbé, un cadran argenté guilloché à chiffres romains et un bracelet à maillons fluide. Une icône discrète de l'horlogerie féminine.",
      "ar": "العلبة البيضاوية المنحنية الشهيرة، بميناء فضي منقوش وأرقام رومانية، على سوار بحلقات انسيابية. أيقونة هادئة في عالم الساعات النسائية."
    },
    "specs": {
      "en": {
        "Case": "Curved oval",
        "Dial": "Silvered guilloché, Roman numerals",
        "Bracelet": "Link bracelet"
      },
      "fr": {
        "Boîtier": "Ovale galbé",
        "Cadran": "Argenté guilloché, chiffres romains",
        "Bracelet": "Bracelet à maillons"
      },
      "ar": {
        "العلبة": "بيضاوية منحنية",
        "الميناء": "فضي منقوش، أرقام رومانية",
        "السوار": "سوار بحلقات"
      }
    },
    "occasions": [
      "anniversary",
      "wedding"
    ],
    "limited": null,
    "active": true,
    "sort": 10
  },
  {
    "id": "omega-ladies",
    "brand": "Omega",
    "name": {
      "en": "Ladies' Diamond Bezel",
      "fr": "Lunette sertie de diamants",
      "ar": "إطار مرصّع بالألماس"
    },
    "cat": "Watches",
    "gender": "women",
    "price": 72000,
    "img": "images/products/omega-ladies-blue.webp",
    "variants": [
      {
        "key": "blue",
        "name": {
          "en": "Sky-blue dial",
          "fr": "Cadran bleu ciel",
          "ar": "ميناء أزرق سماوي"
        },
        "price": 72000,
        "imgs": [
          "images/products/omega-ladies-blue.webp"
        ],
        "swatch": "radial-gradient(circle at 35% 30%,#d3e3f6,#8fb0d8)"
      },
      {
        "key": "white",
        "name": {
          "en": "Silver-white dial",
          "fr": "Cadran blanc argenté",
          "ar": "ميناء أبيض فضي"
        },
        "price": 72000,
        "imgs": [
          "images/products/omega-ladies-white.webp"
        ],
        "swatch": "radial-gradient(circle at 35% 30%,#ffffff,#cfd3d8)"
      }
    ],
    "chain": [],
    "sub": {
      "en": "Steel · gem-set bezel",
      "fr": "Acier · lunette sertie",
      "ar": "فولاذ · إطار مرصّع"
    },
    "description": {
      "en": "A round steel case with a gem-set bezel, a sunray guilloché dial and Roman numerals at 12 and 6, on a polished and brushed link bracelet.",
      "fr": "Un boîtier rond en acier à lunette sertie, un cadran guilloché soleil et des chiffres romains à 12 h et 6 h, sur un bracelet à maillons polis et satinés.",
      "ar": "علبة دائرية من الفولاذ بإطار مرصّع، وميناء منقوش بأشعة الشمس، وأرقام رومانية عند 12 و6، على سوار بحلقات مصقولة ومطفأة."
    },
    "specs": {
      "en": {
        "Case": "Round, steel",
        "Bezel": "Gem-set",
        "Dial": "Sunray guilloché",
        "Bracelet": "Polished & brushed links"
      },
      "fr": {
        "Boîtier": "Rond, acier",
        "Lunette": "Sertie",
        "Cadran": "Guilloché soleil",
        "Bracelet": "Maillons polis & satinés"
      },
      "ar": {
        "العلبة": "دائرية، فولاذ",
        "الإطار": "مرصّع",
        "الميناء": "منقوش بأشعة الشمس",
        "السوار": "حلقات مصقولة ومطفأة"
      }
    },
    "occasions": [
      "anniversary",
      "wedding"
    ],
    "limited": null,
    "active": true,
    "sort": 20
  },
  {
    "id": "bvlgari-oval",
    "brand": "Bvlgari",
    "name": {
      "en": "Oval",
      "fr": "Ovale",
      "ar": "البيضاوية"
    },
    "cat": "Watches",
    "gender": "women",
    "price": 98000,
    "img": "images/products/bvlgari-oval-gold.webp",
    "variants": [
      {
        "key": "gold",
        "name": {
          "en": "Gold, silver dial",
          "fr": "Or, cadran argenté",
          "ar": "ذهبي بميناء فضي"
        },
        "price": 98000,
        "imgs": [
          "images/products/bvlgari-oval-gold.webp"
        ],
        "swatch": "linear-gradient(135deg,#fff3c9,#e2b960 45%,#8f6a22)"
      },
      {
        "key": "pink",
        "name": {
          "en": "Steel, pink dial",
          "fr": "Acier, cadran rose",
          "ar": "فولاذ بميناء وردي"
        },
        "price": 54000,
        "imgs": [
          "images/products/bvlgari-oval-pink.webp"
        ],
        "swatch": "radial-gradient(circle at 35% 30%,#f6c6d8,#d77fa2)"
      }
    ],
    "chain": [],
    "sub": {
      "en": "Oval case · diamond indices",
      "fr": "Boîtier ovale · index diamants",
      "ar": "علبة بيضاوية · مؤشرات ألماس"
    },
    "description": {
      "en": "A soft oval case with a sunray dial, two diamond indices and Arabic 12 and 6, on a supple link bracelet.",
      "fr": "Un boîtier ovale tout en douceur, un cadran soleillé, deux index diamants et les chiffres 12 et 6, sur un bracelet à maillons souple.",
      "ar": "علبة بيضاوية ناعمة بميناء بأشعة الشمس، ومؤشرين من الألماس، والرقمين 12 و6، على سوار بحلقات مرن."
    },
    "specs": {
      "en": {
        "Case": "Oval",
        "Dial": "Sunray, 2 diamond indices",
        "Bracelet": "Link bracelet"
      },
      "fr": {
        "Boîtier": "Ovale",
        "Cadran": "Soleillé, 2 index diamants",
        "Bracelet": "Bracelet à maillons"
      },
      "ar": {
        "العلبة": "بيضاوية",
        "الميناء": "بأشعة الشمس، مؤشران من الألماس",
        "السوار": "سوار بحلقات"
      }
    },
    "occasions": [
      "anniversary",
      "wedding"
    ],
    "limited": null,
    "active": true,
    "sort": 30
  },
  {
    "id": "tissot-cushion",
    "brand": "Tissot",
    "name": {
      "en": "1853 Cushion",
      "fr": "1853 Coussin",
      "ar": "1853 الوسادية"
    },
    "cat": "Watches",
    "gender": "women",
    "price": 6900,
    "img": "images/products/tissot-cushion.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 6900,
        "imgs": [
          "images/products/tissot-cushion.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [],
    "sub": {
      "en": "Steel · diamond indices",
      "fr": "Acier · index diamants",
      "ar": "فولاذ · مؤشرات ألماس"
    },
    "description": {
      "en": "A cushion-shaped steel case with a silver sunray dial, Roman numerals and eight diamond indices — refined, everyday elegance.",
      "fr": "Un boîtier coussin en acier, un cadran argenté soleillé, des chiffres romains et huit index diamants — une élégance raffinée pour tous les jours.",
      "ar": "علبة فولاذية بشكل وسادة، بميناء فضي بأشعة الشمس، وأرقام رومانية وثمانية مؤشرات من الألماس — أناقة راقية لكل يوم."
    },
    "specs": {
      "en": {
        "Case": "Cushion-shaped, steel",
        "Dial": "Silver sunray, 8 diamond indices",
        "Bracelet": "Steel links"
      },
      "fr": {
        "Boîtier": "Forme coussin, acier",
        "Cadran": "Argenté soleillé, 8 index diamants",
        "Bracelet": "Maillons acier"
      },
      "ar": {
        "العلبة": "بشكل وسادة، فولاذ",
        "الميناء": "فضي بأشعة الشمس، 8 مؤشرات ألماس",
        "السوار": "حلقات فولاذية"
      }
    },
    "occasions": [
      "graduation"
    ],
    "limited": null,
    "active": true,
    "sort": 40
  },
  {
    "id": "gshock-ga2100",
    "brand": "Casio G-Shock",
    "name": {
      "en": "GA-2100 Transparent",
      "fr": "GA-2100 Transparente",
      "ar": "GA-2100 الشفافة"
    },
    "cat": "Watches",
    "gender": "unisex",
    "price": 1690,
    "img": "images/products/gshock-ga2100-colours.webp",
    "variants": [
      {
        "key": "red",
        "name": {
          "en": "Red",
          "fr": "Rouge",
          "ar": "أحمر"
        },
        "price": 1690,
        "imgs": [
          "images/products/gshock-ga2100-colours.webp"
        ],
        "swatch": "#e0262b"
      },
      {
        "key": "green",
        "name": {
          "en": "Lime green",
          "fr": "Vert citron",
          "ar": "أخضر ليموني"
        },
        "price": 1690,
        "imgs": [
          "images/products/gshock-ga2100-colours.webp"
        ],
        "swatch": "#7ad321"
      },
      {
        "key": "sky",
        "name": {
          "en": "Sky blue",
          "fr": "Bleu ciel",
          "ar": "أزرق سماوي"
        },
        "price": 1690,
        "imgs": [
          "images/products/gshock-ga2100-colours.webp"
        ],
        "swatch": "#2ec3ef"
      },
      {
        "key": "navy",
        "name": {
          "en": "Navy",
          "fr": "Bleu marine",
          "ar": "كحلي"
        },
        "price": 1690,
        "imgs": [
          "images/products/gshock-ga2100-colours.webp"
        ],
        "swatch": "#163a8c"
      },
      {
        "key": "ice",
        "name": {
          "en": "Ice blue (clear strap)",
          "fr": "Bleu glacier (bracelet translucide)",
          "ar": "أزرق جليدي (سوار شفاف)"
        },
        "price": 1690,
        "imgs": [
          "images/products/gshock-ga2100-colours.webp"
        ],
        "swatch": "linear-gradient(135deg,#9fdcff,#3aa0e8)"
      }
    ],
    "chain": [],
    "sub": {
      "en": "Shock-resistant · 200 m",
      "fr": "Antichoc · 200 m",
      "ar": "مقاومة للصدمات · 200 م"
    },
    "description": {
      "en": "The octagonal G-Shock in a transparent case: shock-resistant, water-resistant to 200 m, with analogue hands and a digital display. Five colours to choose from.",
      "fr": "La G-Shock octogonale dans un boîtier transparent : antichoc, étanche à 200 m, aiguilles analogiques et affichage numérique. Cinq couleurs au choix.",
      "ar": "ساعة G-Shock ثمانية الأضلاع بعلبة شفافة: مقاومة للصدمات، ومقاومة للماء حتى 200 م، بعقارب تناظرية وشاشة رقمية. خمسة ألوان للاختيار."
    },
    "specs": {
      "en": {
        "Case": "Transparent resin, octagonal bezel",
        "Display": "Analogue + digital",
        "Water resistance": "200 m",
        "Strap": "Resin"
      },
      "fr": {
        "Boîtier": "Résine transparente, lunette octogonale",
        "Affichage": "Analogique + numérique",
        "Étanchéité": "200 m",
        "Bracelet": "Résine"
      },
      "ar": {
        "العلبة": "راتنج شفاف، إطار ثماني",
        "العرض": "تناظري + رقمي",
        "مقاومة الماء": "200 م",
        "السوار": "راتنج"
      }
    },
    "occasions": [
      "graduation",
      "justbecause"
    ],
    "limited": null,
    "active": true,
    "sort": 50
  },
  {
    "id": "etoile-filante",
    "brand": "",
    "name": {
      "en": "Étoile Filante",
      "fr": "Étoile Filante",
      "ar": "النجمة الهاوية"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 1450,
    "img": "images/products/necklace-shooting-star.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 1450,
        "imgs": [
          "images/products/necklace-shooting-star.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · white stones",
      "fr": "Argent · pierres blanches",
      "ar": "فضة · أحجار بيضاء"
    },
    "description": {
      "en": "A shooting star set with white stones, gliding along a fine cable chain.",
      "fr": "Une étoile filante sertie de pierres blanches, qui glisse le long d'une fine chaîne forçat.",
      "ar": "نجمة هاوية مرصّعة بأحجار بيضاء، تنساب على سلسلة رفيعة."
    },
    "specs": {
      "en": {
        "Pendant": "Shooting star, pavé-set",
        "Chain": "Fine cable chain, adjustable",
        "Clasp": "Lobster clasp"
      },
      "fr": {
        "Pendentif": "Étoile filante, pavée",
        "Chaîne": "Forçat fine, ajustable",
        "Fermoir": "Mousqueton"
      },
      "ar": {
        "القلادة": "نجمة هاوية مرصّعة",
        "السلسلة": "سلسلة رفيعة قابلة للتعديل",
        "المشبك": "مشبك كركند"
      }
    },
    "occasions": [
      "graduation",
      "justbecause"
    ],
    "limited": null,
    "active": true,
    "sort": 60
  },
  {
    "id": "orbite-nacre",
    "brand": "",
    "name": {
      "en": "Orbite Nacre",
      "fr": "Orbite Nacre",
      "ar": "مدار الصدف"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 1890,
    "img": "images/products/necklace-orbit-pearl.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 1890,
        "imgs": [
          "images/products/necklace-orbit-pearl.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · mother-of-pearl",
      "fr": "Argent · nacre",
      "ar": "فضة · صدف اللؤلؤ"
    },
    "description": {
      "en": "Two interlaced circles — one set with white stones, one inlaid with mother-of-pearl — on a fine chain.",
      "fr": "Deux cercles entrelacés — l'un serti de pierres blanches, l'autre incrusté de nacre — sur une fine chaîne.",
      "ar": "دائرتان متشابكتان — إحداهما مرصّعة بأحجار بيضاء والأخرى مطعّمة بصدف اللؤلؤ — على سلسلة رفيعة."
    },
    "specs": {
      "en": {
        "Pendant": "Interlaced circles, mother-of-pearl inlay",
        "Stones": "White stones",
        "Chain": "Fine cable chain, adjustable"
      },
      "fr": {
        "Pendentif": "Cercles entrelacés, incrustation de nacre",
        "Pierres": "Pierres blanches",
        "Chaîne": "Forçat fine, ajustable"
      },
      "ar": {
        "القلادة": "دائرتان متشابكتان، تطعيم بالصدف",
        "الأحجار": "أحجار بيضاء",
        "السلسلة": "سلسلة رفيعة قابلة للتعديل"
      }
    },
    "occasions": [
      "anniversary"
    ],
    "limited": null,
    "active": true,
    "sort": 70
  },
  {
    "id": "cadeau-soleil",
    "brand": "",
    "name": {
      "en": "Cadeau Soleil",
      "fr": "Cadeau Soleil",
      "ar": "هدية الشمس"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 1690,
    "img": "images/products/necklace-gift-yellow.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 1690,
        "imgs": [
          "images/products/necklace-gift-yellow.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · yellow stone",
      "fr": "Argent · pierre jaune",
      "ar": "فضة · حجر أصفر"
    },
    "description": {
      "en": "An emerald-cut yellow stone crowned with a little bow of white stones — a gift that looks like a gift.",
      "fr": "Une pierre jaune taille émeraude couronnée d'un petit nœud de pierres blanches — un cadeau qui ressemble à un cadeau.",
      "ar": "حجر أصفر بقطع الزمرد يعلوه فيونكة صغيرة من الأحجار البيضاء — هدية تشبه الهدية."
    },
    "specs": {
      "en": {
        "Pendant": "Emerald-cut yellow stone, bow",
        "Stones": "White stones",
        "Chain": "Cable chain"
      },
      "fr": {
        "Pendentif": "Pierre jaune taille émeraude, nœud",
        "Pierres": "Pierres blanches",
        "Chaîne": "Forçat"
      },
      "ar": {
        "القلادة": "حجر أصفر بقطع الزمرد، فيونكة",
        "الأحجار": "أحجار بيضاء",
        "السلسلة": "سلسلة"
      }
    },
    "occasions": [
      "justbecause"
    ],
    "limited": null,
    "active": true,
    "sort": 80
  },
  {
    "id": "noeud-pave",
    "brand": "",
    "name": {
      "en": "Nœud Pavé",
      "fr": "Nœud Pavé",
      "ar": "الفيونكة المرصّعة"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 1590,
    "img": "images/products/necklace-bow-pave.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 1590,
        "imgs": [
          "images/products/necklace-bow-pave.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · pavé bow",
      "fr": "Argent · nœud pavé",
      "ar": "فضة · فيونكة مرصّعة"
    },
    "description": {
      "en": "A softly tied bow, half set with white stones, half polished, that moves with you.",
      "fr": "Un nœud délicatement noué, à moitié pavé de pierres blanches, à moitié poli, qui bouge avec vous.",
      "ar": "فيونكة معقودة برقة، نصفها مرصّع بالأحجار البيضاء ونصفها مصقول، تتحرك معك."
    },
    "specs": {
      "en": {
        "Pendant": "Bow, half pavé-set",
        "Chain": "Fine cable chain",
        "Clasp": "Lobster clasp"
      },
      "fr": {
        "Pendentif": "Nœud, à moitié pavé",
        "Chaîne": "Forçat fine",
        "Fermoir": "Mousqueton"
      },
      "ar": {
        "القلادة": "فيونكة، نصفها مرصّع",
        "السلسلة": "سلسلة رفيعة",
        "المشبك": "مشبك كركند"
      }
    },
    "occasions": [
      "anniversary",
      "wedding"
    ],
    "limited": null,
    "active": true,
    "sort": 90
  },
  {
    "id": "solitaire-lumiere",
    "brand": "",
    "name": {
      "en": "Solitaire Lumière",
      "fr": "Solitaire Lumière",
      "ar": "سوليتير النور"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 1350,
    "img": "images/products/necklace-solitaire.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 1350,
        "imgs": [
          "images/products/necklace-solitaire.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · round stone",
      "fr": "Argent · pierre ronde",
      "ar": "فضة · حجر دائري"
    },
    "description": {
      "en": "A single round brilliant stone held in four claws, framed by a delicate leaf-shaped setting.",
      "fr": "Une pierre ronde taille brillant tenue par quatre griffes, dans un délicat écrin en forme de feuille.",
      "ar": "حجر دائري بقطع بريليانت تمسكه أربعة مخالب، في إطار رقيق على شكل ورقة."
    },
    "specs": {
      "en": {
        "Pendant": "Round brilliant stone, four claws",
        "Chain": "Fine cable chain",
        "Clasp": "Lobster clasp"
      },
      "fr": {
        "Pendentif": "Pierre ronde brillant, quatre griffes",
        "Chaîne": "Forçat fine",
        "Fermoir": "Mousqueton"
      },
      "ar": {
        "القلادة": "حجر دائري بريليانت، أربعة مخالب",
        "السلسلة": "سلسلة رفيعة",
        "المشبك": "مشبك كركند"
      }
    },
    "occasions": [
      "anniversary",
      "wedding"
    ],
    "limited": null,
    "active": true,
    "sort": 100
  },
  {
    "id": "coeur-jardin",
    "brand": "",
    "name": {
      "en": "Cœur Jardin",
      "fr": "Cœur Jardin",
      "ar": "قلب الحديقة"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 2950,
    "img": "images/products/necklace-green-heart.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 2950,
        "imgs": [
          "images/products/necklace-green-heart.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · green heart · halo",
      "fr": "Argent · cœur vert · halo",
      "ar": "فضة · قلب أخضر · هالة"
    },
    "description": {
      "en": "A green heart framed by a halo of white stones, hung from a clear heart-shaped stone. Made for love letters.",
      "fr": "Un cœur vert entouré d'un halo de pierres blanches, suspendu à une pierre claire en forme de cœur. Fait pour les lettres d'amour.",
      "ar": "قلب أخضر تحيط به هالة من الأحجار البيضاء، معلّق بحجر شفاف على شكل قلب. صُنع لرسائل الحب."
    },
    "specs": {
      "en": {
        "Pendant": "Green heart with halo",
        "Stones": "Clear heart + white halo",
        "Chain": "Fine cable chain"
      },
      "fr": {
        "Pendentif": "Cœur vert avec halo",
        "Pierres": "Cœur clair + halo blanc",
        "Chaîne": "Forçat fine"
      },
      "ar": {
        "القلادة": "قلب أخضر بهالة",
        "الأحجار": "قلب شفاف + هالة بيضاء",
        "السلسلة": "سلسلة رفيعة"
      }
    },
    "occasions": [
      "anniversary",
      "wedding"
    ],
    "limited": null,
    "active": true,
    "sort": 110
  },
  {
    "id": "petite-etoile",
    "brand": "",
    "name": {
      "en": "Petite Étoile",
      "fr": "Petite Étoile",
      "ar": "النجمة الصغيرة"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 890,
    "img": "images/products/necklace-little-star.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 890,
        "imgs": [
          "images/products/necklace-little-star.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · marquise stones",
      "fr": "Argent · pierres marquise",
      "ar": "فضة · أحجار ماركيز"
    },
    "description": {
      "en": "A tiny star of marquise-cut stones on a fine chain — for every day, and for layering.",
      "fr": "Une minuscule étoile de pierres taille marquise sur une fine chaîne — pour tous les jours, et pour superposer.",
      "ar": "نجمة صغيرة من أحجار بقطع الماركيز على سلسلة رفيعة — لكل يوم، وللتنسيق مع قلائد أخرى."
    },
    "specs": {
      "en": {
        "Pendant": "Star of marquise-cut stones",
        "Chain": "Fine cable chain"
      },
      "fr": {
        "Pendentif": "Étoile de pierres marquise",
        "Chaîne": "Forçat fine"
      },
      "ar": {
        "القلادة": "نجمة من أحجار الماركيز",
        "السلسلة": "سلسلة رفيعة"
      }
    },
    "occasions": [
      "graduation",
      "justbecause"
    ],
    "limited": null,
    "active": true,
    "sort": 120
  },
  {
    "id": "goutte-lavande",
    "brand": "",
    "name": {
      "en": "Goutte Lavande",
      "fr": "Goutte Lavande",
      "ar": "قطرة الخزامى"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 1550,
    "img": "images/products/necklace-lavender-drop.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 1550,
        "imgs": [
          "images/products/necklace-lavender-drop.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · lavender stone · halo",
      "fr": "Argent · pierre lavande · halo",
      "ar": "فضة · حجر خزامي · هالة"
    },
    "description": {
      "en": "A pear-cut lavender stone surrounded by a halo of white stones. Soft colour, serious sparkle.",
      "fr": "Une pierre lavande taille poire entourée d'un halo de pierres blanches. Couleur douce, éclat sérieux.",
      "ar": "حجر بلون الخزامى بقطع الإجاصة تحيط به هالة من الأحجار البيضاء. لون هادئ وبريق آسر."
    },
    "specs": {
      "en": {
        "Pendant": "Pear-cut lavender stone, halo",
        "Chain": "Fine cable chain"
      },
      "fr": {
        "Pendentif": "Pierre lavande taille poire, halo",
        "Chaîne": "Forçat fine"
      },
      "ar": {
        "القلادة": "حجر خزامي بقطع الإجاصة، هالة",
        "السلسلة": "سلسلة رفيعة"
      }
    },
    "occasions": [
      "anniversary"
    ],
    "limited": null,
    "active": true,
    "sort": 130
  },
  {
    "id": "cadeau-rose",
    "brand": "",
    "name": {
      "en": "Cadeau Rose",
      "fr": "Cadeau Rose",
      "ar": "الهدية الوردية"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 1690,
    "img": "images/products/necklace-gift-pink.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 1690,
        "imgs": [
          "images/products/necklace-gift-pink.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · pink stone",
      "fr": "Argent · pierre rose",
      "ar": "فضة · حجر وردي"
    },
    "description": {
      "en": "A blush-pink emerald-cut stone topped with a beaded bow. Sweet, never sugary.",
      "fr": "Une pierre rose poudré taille émeraude surmontée d'un nœud perlé. Tendre, jamais mièvre.",
      "ar": "حجر وردي فاتح بقطع الزمرد تعلوه فيونكة مزيّنة بالخرز. رقيق دون مبالغة."
    },
    "specs": {
      "en": {
        "Pendant": "Emerald-cut pink stone, beaded bow",
        "Chain": "Cable chain"
      },
      "fr": {
        "Pendentif": "Pierre rose taille émeraude, nœud perlé",
        "Chaîne": "Forçat"
      },
      "ar": {
        "القلادة": "حجر وردي بقطع الزمرد، فيونكة",
        "السلسلة": "سلسلة"
      }
    },
    "occasions": [
      "justbecause"
    ],
    "limited": null,
    "active": true,
    "sort": 140
  },
  {
    "id": "cle-royale",
    "brand": "",
    "name": {
      "en": "Clé Royale",
      "fr": "Clé Royale",
      "ar": "المفتاح الملكي"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 1790,
    "img": "images/products/necklace-royal-key.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 1790,
        "imgs": [
          "images/products/necklace-royal-key.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Silver · crystal key",
      "fr": "Argent · clé sertie",
      "ar": "فضة · مفتاح مرصّع"
    },
    "description": {
      "en": "A crowned key set with clear stones — the key to someone's heart, quite literally.",
      "fr": "Une clé couronnée sertie de pierres claires — la clé d'un cœur, au sens propre.",
      "ar": "مفتاح متوَّج مرصّع بأحجار شفافة — مفتاح القلب، حرفياً."
    },
    "specs": {
      "en": {
        "Pendant": "Crowned key, clear stones",
        "Chain": "Cable chain, adjustable",
        "Clasp": "Lobster clasp"
      },
      "fr": {
        "Pendentif": "Clé couronnée, pierres claires",
        "Chaîne": "Forçat, ajustable",
        "Fermoir": "Mousqueton"
      },
      "ar": {
        "القلادة": "مفتاح متوَّج، أحجار شفافة",
        "السلسلة": "سلسلة قابلة للتعديل",
        "المشبك": "مشبك كركند"
      }
    },
    "occasions": [
      "graduation",
      "justbecause"
    ],
    "limited": null,
    "active": true,
    "sort": 150
  },
  {
    "id": "croissant-or",
    "brand": "",
    "name": {
      "en": "Croissant d'Or",
      "fr": "Croissant d'Or",
      "ar": "الهلال الذهبي"
    },
    "cat": "Jewellery",
    "gender": "women",
    "price": 1250,
    "img": "images/products/necklace-gold-crescent.webp",
    "variants": [
      {
        "key": "default",
        "name": {
          "en": "",
          "fr": "",
          "ar": ""
        },
        "price": 1250,
        "imgs": [
          "images/products/necklace-gold-crescent.webp"
        ],
        "swatch": ""
      }
    ],
    "chain": [
      "40 cm",
      "42 cm",
      "45 cm"
    ],
    "sub": {
      "en": "Golden finish · crescent moon",
      "fr": "Finition dorée · croissant de lune",
      "ar": "لمسة ذهبية · هلال"
    },
    "description": {
      "en": "A polished golden crescent moon with a small silhouette resting inside it, on a fine cable chain.",
      "fr": "Un croissant de lune doré et poli, abritant une petite silhouette, sur une fine chaîne forçat.",
      "ar": "هلال ذهبي مصقول تستقر بداخله صورة ظلية صغيرة، على سلسلة رفيعة."
    },
    "specs": {
      "en": {
        "Pendant": "Crescent moon",
        "Finish": "Polished gold",
        "Chain": "Fine cable chain",
        "Clasp": "Lobster clasp"
      },
      "fr": {
        "Pendentif": "Croissant de lune",
        "Finition": "Dorée polie",
        "Chaîne": "Forçat fine",
        "Fermoir": "Mousqueton"
      },
      "ar": {
        "القلادة": "هلال",
        "اللمسة": "ذهبية مصقولة",
        "السلسلة": "سلسلة رفيعة",
        "المشبك": "مشبك كركند"
      }
    },
    "occasions": [
      "justbecause"
    ],
    "limited": null,
    "active": true,
    "sort": 160
  }
];
