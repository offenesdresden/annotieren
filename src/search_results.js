import React from 'react'
import Route from 'react-route'

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import CardTitle from 'material-ui/lib/card/card-title';
import CardText from 'material-ui/lib/card/card-text';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Avatar from 'material-ui/lib/avatar';
import colors from 'material-ui/lib/styles/colors';
import DescriptionIcon from 'material-ui/lib/svg-icons/action/description'


export default class SearchResults extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      query: "",
      results: [
        {
          "id": "OBR Alt/011/2010",
          "description": "11. Sitzung des Ortsbeirates Altstadt",
          "committee": "Ortsbeirat Altstadt",
          "started_at": "2010-08-19T17:30:00Z",
          "ended_at": "2010-08-19T20:15:00Z",
          "location": "Ortsamt Altstadt, Theaterstr. 11, 01067 Dresden\nBürgersaal, 1. Etage/Zimmer 100",
          "parts": [
            {
              "description": "Anträge und Vorlagen zur Beratung und Berichterstattung an die Gremien des Stadtrates",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            },
            {
              "description": "Erhalt und Entwicklung eines strukturreichen Altbaumbestandes auf dem Gebiet der Landeshauptstadt Dresden",
              "template_id": "A0205/10",
              "documents": [
                {
                  "file_name": "00061090.pdf",
                  "description": "Beschlussausfertigung_A0205/10",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2011-04-21T21:48:35Z",
                    "Last-Modified": "2011-04-21T21:48:40Z",
                    "Author": "Sitzungsdienst 'Session'"
                  }
                },
                {
                  "file_name": "00033428.pdf",
                  "description": "Antrag GRÜNE",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-11-29T22:39:42Z",
                    "Last-Modified": "2010-11-29T22:39:46Z",
                    "Author": "Sitzungsdienst 'Session'"
                  }
                },
                {
                  "file_name": "00033436.pdf",
                  "description": "205_Anlage",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-07-14T21:34:44Z",
                    "Last-Modified": "2010-07-14T21:34:49Z",
                    "Author": "Sitzungsdienst 'Session'"
                  }
                }
              ],
              "decision": "Zustimmung",
              "vote_result": {
                "pro": 9,
                "contra": 7,
                "abstention": 1,
                "prejudiced": 0
              }
            },
            {
              "description": "Drohender Grundschulnotstand in Dresden",
              "template_id": "A0191/10",
              "documents": [
                {
                  "file_name": "00031142.pdf",
                  "description": "Antrag LINKE.",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-06-23T21:35:56Z",
                    "Last-Modified": "2010-06-23T21:36:01Z",
                    "Author": "Sitzungsdienst 'Session'"
                  }
                },
                {
                  "file_name": "00031225.pdf",
                  "description": "Anlage zum Antrag A0191/10 - Grundschulen",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-05-19T12:39:22Z",
                    "Last-Modified": "2010-05-19T12:39:23Z",
                    "Author": "Matthis"
                  }
                }
              ],
              "decision": "Zustimmung",
              "vote_result": {
                "pro": 9,
                "contra": 8,
                "abstention": 0,
                "prejudiced": 0
              }
            },
            {
              "description": "Vorhabenbezogener Bebauungsplan Nr. 695, Dresden-Altstadt II, Nahversorgungszentrum Straßburger Platz\n\nhier: 1. Aufstellungsbeschluss vorhabenbezogener Bebauungsplan\n\n    2. Grenzen des vorhabenbezogenen Bebauungsplanes",
              "template_id": "V0658/10",
              "documents": [
                {
                  "file_name": "00036051.pdf",
                  "description": "Vorlage Gremien",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-07-21T21:35:59Z",
                    "Last-Modified": "2010-07-21T21:36:03Z",
                    "Author": "Sitzungsdienst 'Session'"
                  }
                },
                {
                  "file_name": "00035577.pdf",
                  "description": "VB 695_Anlage1-Geltungsbereich",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-07-21T21:35:27Z",
                    "Last-Modified": "2010-07-21T21:35:31Z",
                    "Author": "Sitzungsdienst 'Session'"
                  }
                },
                {
                  "file_name": "00035578.pdf",
                  "description": "VB 695_Anlage2-Geltungsbereich",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-07-07T07:53:23Z",
                    "Last-Modified": "2010-07-07T07:53:36Z",
                    "Author": "Nutzer"
                  }
                },
                {
                  "file_name": "00035579.pdf",
                  "description": "VB 695_Anlage3-Planungskonzept",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-04-15T15:33:51Z",
                    "Last-Modified": "2010-04-15T15:33:51Z",
                    "Author": "mann"
                  }
                }
              ],
              "decision": "Zustimmung",
              "vote_result": {
                "pro": 14,
                "contra": 2,
                "abstention": 1,
                "prejudiced": 0
              }
            },
            {
              "description": "Prioritätenliste zum Bau fehlender und zur Sanierung stark instandsetzungsbedürftiger Fußwege",
              "template_id": "A0195/10",
              "documents": [
                {
                  "file_name": "00033382.pdf",
                  "description": "Antrag FDP",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-10-12T21:36:45Z",
                    "Last-Modified": "2010-10-12T21:36:49Z",
                    "Author": "Sitzungsdienst 'Session'"
                  }
                },
                {
                  "file_name": "00138849.pdf",
                  "description": "A0195/10 Abschlussbericht_2013_07_03",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2013-07-15T11:24:25Z",
                    "Last-Modified": "2013-07-15T11:24:25Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00123277.pdf",
                  "description": "BK A0195/12 Zw.-Bericht 31.01.2013",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2013-02-14T09:15:42Z",
                    "Last-Modified": "2013-02-14T09:15:42Z",
                    "Author": null
                  }
                }
              ],
              "decision": "Zustimmung mit Änderung",
              "vote_result": {
                "pro": 17,
                "contra": 0,
                "abstention": 0,
                "prejudiced": 0
              }
            },
            {
              "description": "Vorlagen zur Information",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            },
            {
              "description": "Helmut-Schön-Ehrung - Namensgebung - Straße",
              "template_id": "A0212/10",
              "documents": [
                {
                  "file_name": "00037448.pdf",
                  "description": "Antrag Interfraktionell",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2010-08-09T21:39:15Z",
                    "Last-Modified": "2010-08-09T21:39:19Z",
                    "Author": "Sitzungsdienst 'Session'"
                  }
                }
              ],
              "decision": "zur Kenntnis genommen",
              "vote_result": null
            },
            {
              "description": "Kontrolle der Niederschrift zur 10. Ortsbeiratssitzung am 21.06.2010",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            },
            {
              "description": "Informationen, Hinweise und Anfragen",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            }
          ],
          "documents": [
            {
              "file_name": "00037353.pdf",
              "description": "Einladung_OBR Alt_19.08.2010",
              "pdf_metadata": {
                "Content-Length": "application/pdf",
                "Content-Type": "application/pdf",
                "Creation-Date": "2010-08-11T21:35:36Z",
                "Last-Modified": "2010-08-11T21:35:40Z",
                "Author": "Sitzungsdienst 'Session'"
              }
            },
            {
              "file_name": "00038939.pdf",
              "description": "Niederschrift öffentlich_OBR Alt_19.08.2010",
              "pdf_metadata": {
                "Content-Length": "application/pdf",
                "Content-Type": "application/pdf",
                "Creation-Date": "2010-09-10T21:35:33Z",
                "Last-Modified": "2010-09-10T21:35:39Z",
                "Author": "Sitzungsdienst 'Session'"
              }
            }
          ],
          "downloaded_at": "2016-02-03T18:24:23Z",
          "session_url": "http://ratsinfo.dresden.de/to0040.php?__ksinr=967"
        },
        {
          "id": "OSR AF/005/2015",
          "description": "5. Sitzung des Ortschaftsrates Altfranken",
          "committee": "Ortschaftsrat Altfranken",
          "started_at": "2015-01-12T19:30:00Z",
          "ended_at": "2015-01-12T20:45:00Z",
          "location": "Landeshauptstadt Dresden,  im Ortschaftszentrum Altfranken, Sitzungssaal,\nOtto-Harzer-Straße 2 b, 01156 Dresden",
          "parts": [
            {
              "description": "Neubau der Kita in Altfranken - Gespräch mit dem Architekten",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            },
            {
              "description": "Vorstellung des Konzeptes der offenen Kinder- und Jugendarbeit in der Ortschaft Altfranken",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            },
            {
              "description": "Zweite Fortschreibung Spielplatzentwicklungskonzeption",
              "template_id": "V0120/14",
              "documents": [
                {
                  "file_name": "00207503.pdf",
                  "description": "Beschlussausfertigung_SR_V0120/14",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2015-05-13T13:30:07Z",
                    "Last-Modified": "2015-05-13T13:30:16Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00234249.pdf",
                  "description": "BK_V0120/14_2015_12_04_Zwischenbericht",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2015-12-07T17:55:20Z",
                    "Last-Modified": "2015-12-07T17:55:37Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00182931.pdf",
                  "description": "Vorlage Gremien",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2015-01-30T19:38:22Z",
                    "Last-Modified": "2015-01-30T19:38:22Z",
                    "Author": "schoeng"
                  }
                },
                {
                  "file_name": "00196776.pdf",
                  "description": "Vorlage Gremien - Änderung nach Hauptsatzungsänderung (UA JH-Planung -- UA Planung)",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2015-02-19T22:12:18Z",
                    "Last-Modified": "2015-02-19T22:12:18Z",
                    "Author": "eclaus"
                  }
                },
                {
                  "file_name": "00181890.pdf",
                  "description": "00_SPEK DD_Bericht-Endfassung Juni 2013",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2013-06-07T07:50:54Z",
                    "Last-Modified": null,
                    "Author": "Administrator"
                  }
                },
                {
                  "file_name": "00181891.pdf",
                  "description": "01_Anlage 1_Spielplätze Bestand (12_2011)",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2013-06-04T17:08:42Z",
                    "Last-Modified": null,
                    "Author": "Administrator"
                  }
                },
                {
                  "file_name": "00181892.pdf",
                  "description": "02_Anlage 2_Flächenbilanz 6-17 Jahre",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2013-06-04T17:00:37Z",
                    "Last-Modified": null,
                    "Author": "Administrator"
                  }
                },
                {
                  "file_name": "00181893.pdf",
                  "description": "03_Anlage 3_Tabelle_Standortvorschläge",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2013-05-30T12:26:44Z",
                    "Last-Modified": null,
                    "Author": "Administrator"
                  }
                },
                {
                  "file_name": "00181894.pdf",
                  "description": "04_Anlage 4_Spielleitplanung",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2013-06-04T16:54:21Z",
                    "Last-Modified": null,
                    "Author": "Administrator"
                  }
                },
                {
                  "file_name": "00181906.pdf",
                  "description": "Plan 01 Spielplatzbestand 6-17 Jahre",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2012-08-20T08:36:35Z",
                    "Last-Modified": "2012-08-20T08:36:35Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00181907.pdf",
                  "description": "Plan 02 Spielplatzbestand 0-5 Jahre",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2012-08-23T09:03:26Z",
                    "Last-Modified": "2012-08-23T09:03:26Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00181908.pdf",
                  "description": "Plan 03.1 Defizitkarte 6-11 Jahre",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2012-08-20T09:42:10Z",
                    "Last-Modified": "2012-08-20T09:42:10Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00181909.pdf",
                  "description": "Plan 03.2 Defizitkarte 12-17 Jahre",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2012-08-21T07:35:36Z",
                    "Last-Modified": "2012-08-21T07:35:36Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00181910.pdf",
                  "description": "Plan 04.1 Veränderungskarte 6-11 Jahre",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2012-08-20T10:15:37Z",
                    "Last-Modified": "2012-08-20T10:15:37Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00181911.pdf",
                  "description": "Plan 04.2 Veränderungskarte 12-17 Jahre",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2012-08-20T10:32:35Z",
                    "Last-Modified": "2012-08-20T10:32:35Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00181912.pdf",
                  "description": "Plan_05 Spielplatzentwicklungskonzept",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2013-05-08T08:42:58Z",
                    "Last-Modified": "2013-05-08T08:42:58Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00181914.pdf",
                  "description": "Beschlüsse",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2013-07-02T07:51:45Z",
                    "Last-Modified": "2014-10-15T08:47:38Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00182539.pdf",
                  "description": "Stellungnahme Gleichstellungsbeauftragte",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2014-10-15T08:44:28Z",
                    "Last-Modified": "2014-10-15T08:44:39Z",
                    "Author": null
                  }
                },
                {
                  "file_name": "00206585.pdf",
                  "description": "Änderungsantrag interfraktionell",
                  "pdf_metadata": {
                    "Content-Length": "application/pdf",
                    "Content-Type": "application/pdf",
                    "Creation-Date": "2015-05-07T09:16:54Z",
                    "Last-Modified": "2015-05-07T09:17:02Z",
                    "Author": null
                  }
                }
              ],
              "decision": "Vertagung",
              "vote_result": null
            },
            {
              "description": "Sonstiges",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            },
            {
              "description": "Vorschläge für UrbanArt",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            },
            {
              "description": "Informationen des Ortsvorstehers",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            },
            {
              "description": "Sauberes Altfranken",
              "template_id": null,
              "documents": [

              ],
              "decision": null,
              "vote_result": null
            }
          ],
          "documents": [
            {
              "file_name": "00190276.pdf",
              "description": "Einladung_OSR AF",
              "pdf_metadata": {
                "Content-Length": "application/pdf",
                "Content-Type": "application/pdf",
                "Creation-Date": "2015-01-30T19:27:39Z",
                "Last-Modified": "2015-01-30T19:27:39Z",
                "Author": "mrugalla"
              }
            },
            {
              "file_name": "00192951.pdf",
              "description": "Niederschrift öffentlich",
              "pdf_metadata": {
                "Content-Length": "application/pdf",
                "Content-Type": "application/pdf",
                "Creation-Date": "2015-02-10T19:09:43Z",
                "Last-Modified": "2015-02-10T19:09:43Z",
                "Author": "mrugalla"
              }
            }
          ],
          "downloaded_at": "2016-02-04T01:02:01Z",
          "session_url": "http://ratsinfo.dresden.de/to0040.php?__ksinr=4198"
        }    
      ]
    }
  }
  
  render() {
    return (
      <div>
        {this.state.results.map((result, i) =>
          <Card key={i}>
            <CardHeader
                title={result.description}
                subtitle={result.started_at}
                style={{ backgroundColor: colors.lime500 }}
                titleStyle={{ fontWeight: "bold", fontSize: "120%" }}
                />
            <CardText>
              <List>
                {result.parts.map((part, j) =>
                  <ListItem key={j} disabled={true}>
                    <Avatar color="white" size={48} style={{float: "left", clear: "left"}}
                        backgroundColor={templateIdToColor(part.template_id)}
                        title={templateIdToTitle(part.template_id)}
                        >
                      {part.template_id && part.template_id[0]}
                    </Avatar>
                    <div>
                      <List subheader={part.description}>
                        {part.documents.map((doc, k) =>
                          <ListItem key={k}
                              onClick={ev => this.handleDocumentClick(ev, doc)}
                              >
                            <DescriptionIcon color="#ccc"/>
                            {doc.description}
                          </ListItem>
                        )}
                      </List>
                    </div>
                  </ListItem>
                )}
              </List>
            </CardText>
          </Card>
        )}
      </div>
    )
  }

  handleDocumentClick(ev, doc) {
    let docId = doc.file_name.replace(/\..*/, "")
    Route.go(`/doc/${docId}`)
  }
}

function templateIdToTitle(template_id) {
  if (/^V/.test(template_id)) {
    return `Vorlage ${template_id}`
  } else if (/^A/.test(template_id)) {
    return `Antrag ${template_id}`
  } else if (template_id) {
    return template_id
  } else {
    return "Keine Vorlage"
  }
}

function templateIdToColor(template_id) {
  if (/^V/.test(template_id)) {
    return colors.deepPurple500
  } else if (/^A/.test(template_id)) {
    return colors.lightBlue500
  } else if (template_id) {
    return colors.lightGreen500
  } else {
    return colors.lightGreen200
  }
}
