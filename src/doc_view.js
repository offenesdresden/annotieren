import React from 'react'

import Paper from 'material-ui/lib/paper'
import AppBar from 'material-ui/lib/app-bar'
import colors from 'material-ui/lib/styles/colors'
import FlatButton from 'material-ui/lib/flat-button'
import IconButton from 'material-ui/lib/icon-button';
import ActionHome from 'material-ui/lib/svg-icons/action/home';

import Fragments from './fragments'
import DocText from './doc_text'
import AnnotateBar from './annotate_bar'


const TEXT = `Landeshauptstadt Dresden Ortschaftsrat Schönfeld-Weißig

N I E D E R S C H R I F T

zum öffentlichen Teil

der 14. Sitzung des Ortschaftsrates Schönfeld-Weißig (Sondersitzung) (OSR SW/014/2015)

am Donnerstag, 16. Juli 2015,

19:30 Uhr

in der Verwaltungsstelle Schönfeld-Weißig, Ratssaal, 2. Etage, Raum 208/209, Bautzner Landstraße 291, 01328 Dresden

2/8 ö NS OSR SW/014/2015 16. Juli 2015

Öffentlicher Teil der Sitzung: Beginn: 19:30Uhr Ende: 20:00 Uhr Anwesend: Vorsitzende Daniela Walter Mitglied Liste CDU Hans-Jürgen Behr Bernd Forker Renate Franz Bernd Jannasch Mario Quast Matthias Rath Mitglied Liste DIE LINKE Norbert Kunzmann Mitglied Liste Bündnis 90/Die Grünen Manuela Schott Reinhard Vetters Mitglied Liste FDP Manfred Eckelt Mitglied Liste Unabhängige Wählergemeinschaft Schönfelder Hochland Werner Friebel Olaf Zeisig Verwaltungsmitarbeiter Bernd Mizera Abwesend: Mitglied Liste CDU Carsten Preussler Manuela Schreiter Holger Walzog Dr. Christian Schnoor Mitglied Liste SPD Joachim Kubista

3/8 ö NS OSR SW/014/2015 16. Juli 2015

T A G E S O R D N U N G Öffentlich 1 Begrüßung, Feststellung der Beschlussfähigkeit

2 Einwendungen zur Niederschrift der 12. Sitzung vom 24.06.2015

2.1 Antrag der Bürgervereinigung Schullwitz e. V. zur Turnhalle Schul-

lwitz aus der Investitionspauschale der Ortschaft Schönfeld-Weißig V-SW0046/15 beschließend

2.1.1 Antrag Frau Schott den Antrag der Bürgervereinigung Schullwitz

zurückzustellen A-SW0024/15 beschließend

3 Sonstige Anfragen der Ortschaftsräte und Informationen

4/8 ö NS OSR SW/014/2015 16. Juli 2015

öffentlich 1 Begrüßung, Feststellung der Beschlussfähigkeit

Die OVin eröffnet die Sitzung um 19:30 Uhr und begrüßt die Räte und Gäste; die Beschlussfähigkeit wird mit 13 Räten festgestellt. 2 Einwendungen zur Niederschrift der 12. Sitzung vom

24.06.2015

ORin Schott merkt an, dass eine protokollarische Ergänzung erfolgen müsse bezüglich des TOP 2 zum Thema Antrag der Bürgervereinigung Schullwitz, Seite 7. Im Protokoll müsse stehen, dass sich ORin Schreiter an der Diskussion beteiligte und erst aufgrund des Hinweises von OR Kubista den Platz neben der OVin als Gast einnahm, so wie es OR Dr. Schnoor deklarierte. Dies sei laut Geschäftsordnung relevant. Die OVin lässt dies prüfen und es wird gegebenenfalls eine Änderung im Protokoll erfolgen. 2.1 Antrag der Bürgervereinigung Schullwitz e. V. zur Turnhalle

Schullwitz aus der Investitionspauschale der Ortschaft Schönfeld-Weißig

      `

export default class DocView extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      description: "Beschlussausfertigung_A0205/10",
      fragments: new Fragments([{ text: TEXT, begin: 0, end: TEXT.length }]),
      annotations: []
    }
  }

  setAnnotationFragments(annotation) {
    let { begin, end } = annotation
    this.state.fragments.withFragments(begin, end, fragment => {
      if (!fragment.annotation ||
          fragment.annotation.begin < begin) {
        fragment.annotation = annotation
      }
    })
    this.setState({
      fragments: this.state.fragments
    })
  }

  addAnnotation(annotation) {
    this.setState({
      annotations: this.state.annotations.concat(annotation),
      currentAnnotation: annotation
    })
  }
  
  render() {
    return (
      <div>
        <Paper
            style={{maxWidth: "60em", margin: "0 auto"}}
            >
          <AppBar title={this.state.description}
              showMenuIconButton={false}
              iconElementLeft={<IconButton title="Zurück zur Suche"><ActionHome/></IconButton>}
              iconElementRight={<FlatButton label="PDF" title="Original-PDF herunterladen"/>}
              />
          <DocText fragments={this.state.fragments}
              onSelection={slice => this.handleTextSelection(slice)}
              currentAnnotation={this.state.currentAnnotation}
              onClick={annotation => this.handleClickAnnotation(annotation)}
              />
        </Paper>
        <AnnotateBar currentAnnotation={this.state.currentAnnotation} onType={type => this.handleSelectType(type)}/>
      </div>
    )
  }

  /**
   * DocText events handlers
   **/
  
  handleTextSelection(slice) {
    if (slice) {
      // Makes it available to AnnotateBar & DocText
      // TODO: prevent updating DocText just yet by separating selection and currentAnnotation
      this.setState({
        currentAnnotation: {
          id: generateAnnotationId(),
          type: 'new',
          begin: slice.begin,
          end: slice.end
        }
      })
    } else {
      this.setState({
        currentAnnotation: null
      })
    }
  }

  handleClickAnnotation(annotation) {
    if (this.state.currentAnnotation && this.state.currentAnnotation.type === 'new') {
      return
    }
    
    console.log("currentAnnotation=", annotation)
    this.setState({
      currentAnnotation: annotation
    })
  }
  
  /**
   * AnnotateBar events handlers
   **/
  
  handleSelectType(type) {
    let annotation = this.state.currentAnnotation
    if (!annotation) return

    if (this.state.currentAnnotation.type === 'new') {
      // Turn a new into a permanent one
      annotation.type = type
      this.addAnnotation(annotation)
    } else {
      // Update existing annotation
      annotation.type = type
    }
    // Update DocText
    this.setAnnotationFragments(annotation)
  }
}

let lastAnnotationId = 0
function generateAnnotationId() {
  return (lastAnnotationId++).toString()
}
