const TYPES = [
  { title: "Vorlage/Anfrage",
    types: [
      { id: 'paper.reference',
        title: "Aktenzeichen",
        hint: "Daran werden Dateiabschnitte zu Vorlagen/Anfragen erkannt.",
        rgb: "127,239,127",
        metadata: ['paper']
      },
      { id: 'paper.name',
        title: "Titel",
        rgb: "127,255,127",
        metadata: ['paper']
      },
      { id: 'paper.proposition',
        title: "Beschlussvorschlag",
        rgb: "159,255,159"
      },
      { id: 'paper.reason',
        title: "Begründung",
        rgb: "191,255,191"
      },
      { id: 'paper.resolution',
        title: "Beschluss",
        rgb: "223,255,223"
      }
    ]
  },
  { title: "Wortprotokoll",
    types: [
      { id: 'record.speaker',
        title: "Sprecher",
        hint: "Wer hat es gesagt?",
        rgb: "191,191,255",
        metadata: ['person']
      },
      { id: 'record.protocol',
        title: "Niederschrift",
        hint: "Zusammengefasster Inhalt",
        rgb: "207,207,255"
      },
      { id: 'record.transcript',
        title: "Wortlaut",
        hint: "Wortwörtliches Transkript",
        rgb: "223,223,255"
      }
    ]
  },
  { title: "Abstimmung",
    types: [
      { id: 'vote.yes',
        title: "Ja-Stimmen",
        hint: "Stimmenanzahl oder Personenname",
        rgb: "255,79,255"
      },
      { id: 'vote.no',
        title: "Nein-Stimmen",
        hint: "Stimmenanzahl oder Personenname",
        rgb: "255,111,255"
      },
      { id: 'vote.neutral',
        title: "Enthaltungen",
        hint: "Stimmenanzahl oder Personenname",
        rgb: "255,143,255"
      },
      { id: 'vote.biased',
        title: "Befangen",
        hint: "Stimmenanzahl oder Personenname",
        rgb: "255,175,255"
      },
      { id: 'vote.result',
        title: "Ergebnis",
        hint: "\"Zustimmung mit Änderung\"",
        rgb: "255,207,255"
      }
    ]
  },
  { title: "Verweis",
    types: [
      { id: 'ref.person',
        title: "Person",
        rgb: "255,127,127",
        metadata: ['person']
      },
      { id: 'ref.organization',
        title: "Gremium",
        rgb: "255,143,143",
        metadata: ['organization']
      },
      { id: 'ref.meeting',
        title: "Sitzung",
        rgb: "255,159,159",
        metadata: ['meeting']
      },
      { id: 'ref.paper',
        title: "Vorlage/Anfrage",
        rgb: "255,175,175",
        metadata: ['paper']
      },
      { id: 'ref.file',
        title: "Datei",
        rgb: "255,191,191",
        metadata: ['file']
      },
      { id: 'ref.location',
        title: "Ort",
        rgb: "255,207,207",
        metadata: ['location']
      }
    ]
  },
/*  { title: "",
    types: [
      { title: "",
        rgb: ""
      },
      { title: "",
        rgb: ""
      }
    ]
  } */
]
export default TYPES

let byIdCache = null

export function getTypeById(id) {
  if (!byIdCache) {
    byIdCache = {}
    for(let category of TYPES) {
      for(let type of category.types) {
        byIdCache[type.id] = type
      }
    }
  }

  return byIdCache[id] || {
    id: 'unknown',
    title: "Unbekannt",
    rgb: "31,31,31"
  }
}
