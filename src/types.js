let TYPES = [
  { title: "Dokument",
    color: (type, i) => `hsl(30, ${80 + 5 * i}%, ${60 + 15 * i}%)`,
    types: [
      { id: 'doc.date',
        title: "Datum",
        hint: "Zeitpunkt der Herausgabe/Veröffentlichung"
      },
      { id: 'doc.originator',
        title: "Autor/-in",
        hint: "Von wem kommts?",
        metadata: ['person']
      },
      { id: 'doc.recipient',
        title: "Empfänger/-in",
        hint: "An jemanden gerichtet?",
        metadata: ['person']
      }
    ]
  },
  // { title: "Sitzung",
  //   color: (type, i) => `hsl(225, ${50 + 10 * i}%, ${70 + 10 * i}%)`,
  //   types: [
  //     { id: 'meeting.participant',
  //       title: "Teilnehmer/-in",
  //       hint: "Wer war da?",
  //       metadata: ['person']
  //     },
  //     { id: 'meeting.absent',
  //       title: "Abwesend",
  //       hint: "Wer fehlte?",
  //       metadata: ['person']
  //     }
  //   ]
  // },
  { title: "Vorlage/Anfrage",
    color: (type, i) => `hsl(120, 60%, ${65 + 15 * i}%)`,
    types: [
      { id: 'paper.reference',
        title: "Aktenzeichen",
        hint: "Daran werden Dateiabschnitte zu Vorlagen/Anfragen erkannt.",
        metadata: ['paper']
      },
      { id: 'paper.name',
        title: "Titel",
        metadata: ['paper']
      }
    ]
  },
  { title: "Anfrage",
    color: (type, i) => `hsl(60, ${75 + 10 * i}%, ${60 + 15 * i}%)`,
    types: [
      { id: 'paper.intro',
        title: "Einleitung",
      },
      { id: 'paper.inquiry',
        title: "Fragestellung",
      },
      { id: 'paper.response',
        title: "Antwort",
      }
    ]
  },
  { title: "Vorlage",
    color: (type, i) => `hsl(180, ${50 + 8 * i}%, ${60 + 6 * i}%)`,
    types: [
      { id: 'paper.proposition',
        title: "Beschlussvorschlag",
      },
      { id: 'paper.reason',
        title: "Begründung",
      },
      { id: 'paper.comment',
        title: "Stellungnahme",
      },
      { id: 'paper.amendment',
        title: "Änderung",
      },
      { id: 'paper.supplement',
        title: "Ergänzung",
      },
      { id: 'paper.resolution',
        title: "Beschluss",
      },
      { id: 'paper.report',
        title: "Beschlusskontrolle",
      }
    ]
  },
  { title: "Wortprotokoll",
    color: (type, i) => `hsl(225, 100%, ${85 + 5 * i}%)`,
    types: [
      { id: 'record.speaker',
        title: "Sprecher/-in",
        hint: "Wer hat es gesagt?",
        metadata: ['person']
      },
      { id: 'record.protocol',
        title: "Niederschrift",
        hint: "Zusammengefasster Inhalt",
      },
      { id: 'record.transcript',
        title: "Wortlaut",
        hint: "Wortwörtliches Transkript",
      }
    ]
  },
  { title: "Abstimmung",
    color: (type, i) => `hsl(300, 50%, ${70 + 5 * i}%)`,
    types: [
      { id: 'vote.yes',
        title: "Ja-Stimmen",
        hint: "Stimmenanzahl oder Personenname",
      },
      { id: 'vote.no',
        title: "Nein-Stimmen",
        hint: "Stimmenanzahl oder Personenname",
      },
      { id: 'vote.neutral',
        title: "Enthaltungen",
        hint: "Stimmenanzahl oder Personenname",
      },
      { id: 'vote.biased',
        title: "Befangen",
        hint: "Stimmenanzahl oder Personenname",
      },
      { id: 'vote.result',
        title: "Ergebnis",
        hint: "\"Zustimmung mit Änderung\"",
      }
    ]
  },
  { title: "Verweis",
    color: (type, i) => `hsl(0, 80%, ${65 + 5 * i}%)`,
    types: [
      { id: 'ref.person',
        title: "Person",
        metadata: ['person']
      },
      { id: 'ref.organization',
        title: "Gremium",
        metadata: ['organization']
      },
      { id: 'ref.meeting',
        title: "Sitzung",
        metadata: ['meeting']
      },
      { id: 'ref.paper',
        title: "Vorlage/Anfrage",
        metadata: ['paper']
      },
      { id: 'ref.file',
        title: "Datei",
        metadata: ['file']
      },
      // { id: 'ref.location',
      //   title: "Ort",
      //   rgb: "255,207,207",
      //   metadata: ['geolocation']
      // }
    ]
  },
  // Autor: Gremium, Person
  // Anwesenheit: Anwesend, Abwesend, Verlassen, Erscheinen
  // Gelder: Einnahmen, Einsparungen, Ausgaben
  // Links? Termine?
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

for(let category of TYPES) {
  let i = 0
  for(let type of category.types) {
    type.color = category.color(type, i)
    i += 1
  }
}

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
