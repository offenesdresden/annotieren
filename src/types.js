const TYPES = [
  { title: "Vorlage/Anfrage",
    types: [
      { id: 'paper.reference',
        title: "Aktenzeichen",
        rgb: "95,255,95"
      },
      { id: 'paper.name',
        title: "Titel",
        rgb: "127,255,127"
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
        rgb: "191,191,255"
      },
      { id: 'record.protocol',
        title: "Niederschrift",
        rgb: "207,207,255"
      },
      { id: 'record.transcript',
        title: "Wortlaut",
        rgb: "223,223,255"
      }
    ]
  },
  { title: "Verweis",
    types: [
      { id: 'ref.person',
        title: "Person",
        rgb: "255,127,127"
      },
      { id: 'ref.organization',
        title: "Gremium",
        rgb: "255,143,143"
      },
      { id: 'ref.meeting',
        title: "Sitzung",
        rgb: "255,159,159"
      },
      { id: 'ref.paper',
        title: "Vorlage/Anfrage",
        rgb: "255,175,175"
      },
      { id: 'ref.file',
        title: "Datei",
        rgb: "255,191,191"
      },
      { id: 'ref.location',
        title: "Ort",
        rgb: "255,207,207"
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
