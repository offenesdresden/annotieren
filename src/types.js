const TYPES = [
  { title: "Kapitel",
    types: [
      { id: 'chapter.reference',
        title: "Aktenzeichen",
        rgb: "255,255,127",
        fields: [{
          name: 'paper',
        }]
      },
      { id: 'chapter.title',
        title: "Titel",
        rgb: "255,255,159"
      },
      { id: 'chapter.resolution',
        title: "Beschluss",
        rgb: "255,255,191"
      }
    ]
  },
  { title: "Wortprotokoll",
    types: [
      { id: 'record.speaker',
        title: "Sprecher",
        rgb: "191,191,255"
      },
      { id: 'record.transcript',
        title: "Niederschrift",
        rgb: "223,223,255"
      }
    ]
  },
  { title: "Datenpunkte",
    types: [
      { id: 'location',
        title: "Ort",
        rgb: "191,127,127"
      },
      { id: 'file',
        title: "Dateiverweis",
        rgb: "223,191,191"
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
