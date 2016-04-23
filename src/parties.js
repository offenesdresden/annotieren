const PARTIES = [{
  id: "32",
  name: "SPD-Fraktion",
  rgb: "191,0,0"
}, {
  id: "33",
  name: "Fraktion DIE LINKE.",
  rgb: "150,0,0"
}, {
  id: "30",
  name: "Fraktion Bündnis 90/Die Grünen",
  rgb: "0,191,0"
}, {
  id: "34",
  name: "FDP-Fraktion",
  rgb: "127,127,0"
}, {
  id: "5",
  name: "CDU-Fraktion",
  rgb: "0,0,0"
}, {
  id: "115",
  name: "Fraktion Bündnis Freie Bürger",
  rgb: "127,127,0"
}, {
  id: "35",
  name: "BürgerBündnis / Freie Bürger Fraktion",
  rgb: "127,127,0"
}, {
  id: "120",
  name: "Fraktion Alternative für Deutschland",
  rgb: "63,63,191"
}, {
  id: "121",
  name: "FDP/FB-Fraktion",
  rgb: "127,127,0"
}]

export default PARTIES

let partyById = {}
for(var party of PARTIES) {
  partyById[party.id] = party
}

// TODO: depends on membership and context dates
export function getPersonParty(person) {
  for(var membership of (person.membership || [])) {
    if (partyById.hasOwnProperty(membership.organization)) {
      return partyById[membership.organization]
    }
  }
  return null
}
