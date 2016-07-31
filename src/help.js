import React from 'react'
import Route from 'react-route'

import PaperAvatar from './paper_avatar'


export default class Help extends React.Component {
  render() {
    return (
      <article className="help">
        <h1>Hilfe</h1>
        
        <h2>Was ist "annotieren"?</h2>
        <p>Eine Annotation ist eine Anmerkung im Sinne der Ergänzung bzw. Erklärung.</p>

        <h2>Woher kommen die Daten?</h2>
        <p>Die im Stadtrat anfallenden Dokumente werden im <a href="http://www.dresden.de/de/rathaus/politik/stadtrat/ratsinfo.php">Ratsinfosystem der Stadt Dresden</a> veröffentlicht und mittels eines <a href="https://github.com/offenesdresden/dresden-ratsinfo">Scrapers</a> in maschinenlesbare Form gebracht. Dieser Datensatz ist auch <a href="https://github.com/offenesdresden/dresden-ratsinfo">auf Github erhältlich.</a></p>

        <h2>Warum das alles?</h2>
        <p>"Open Data bedeutet die freie Verfügbar- und Nutzbarkeit von – meist öffentlichen – Daten. Die Forderung danach beruht auf der Annahme, dass vorteilhafte Entwicklungen unterstützt werden wie Open Government, wenn adressatengerecht und benutzerfreundlich aufbereitete Informationen öffentlich zugänglich gemacht werden und damit mehr Transparenz und Zusammenarbeit ermöglichen." - <a href="https://de.wikipedia.org/wiki/Open_Data">Wikipedia</a></p>

        <h2>Vorgangsarten</h2>
        <ul>
          <li><PaperAvatar paper={{ shortName: 'V' }}/> Vorlagen</li>
          <li><PaperAvatar paper={{ shortName: 'AF' }}/> Anfragen</li>
          <li><PaperAvatar paper={{ shortName: 'mAF' }}/> mündliche Anfragen</li>
          <li><PaperAvatar paper={{ shortName: 'P' }}/> Petitionen</li>
        </ul>
        <h2>Erste Schritte</h2>
        <ul>
          <li><a href="#" onClick={() => Route.go('/register')}>Registrieren</a></li>
          <li>Auf der Hauptseite unter <i>Neueste Anfragen &amp; Vorlagen</i> oder mithilfe der Suche Dokumente finden</li>
          <li>Mit der Maus Text markieren und anschließend im Menü auf der rechten Seite den Annonationstyp festlegen</li>
          <li>Zur Überprüfung später die Zusammenfassung über die Vorgangsansicht betrachten</li>
        </ul>
        <h3>Anfrage</h3>
        <video src="tutorials/anfrage.mp4" type="video/mp4" controls width="640" height="460"></video>
        <h3>Niederschrift</h3>
        <video src="tutorials/niederschrift.mp4" type="video/mp4" controls width="640" height="460"></video>
        <h3>Vorlage</h3>
        <video src="tutorials/vorlage.mp4" type="video/mp4" controls width="640" height="460"></video>

        <h2>Beispiele für Annotationen</h2>
        <ul>
          <li><a href="#" onClick={() => Route.go('/file/163502')}>Antrag</a></li>
          <li><a href="#" onClick={() => Route.go('/file/170622')}>Niederschrift mit Abstimmungen</a></li>
          <li><a href="#" onClick={() => Route.go('/file/255226')}>Petition</a></li>
          <li><a href="#" onClick={() => Route.go('/file/127742')}>Anfrage</a> &amp; <a href="#" onClick={() => Route.go('/file/125916')}>Antwort</a></li>
          <li><a href="#" onClick={() => Route.go('/file/175339')}>Einwohneranfrage</a></li>
          <li><a href="#" onClick={() => Route.go('/file/161687')}>Vorlage</a></li>
          <li><a href="#" onClick={() => Route.go('/file/166580')}>Beschlussempfehlung</a></li>
          <li><a href="#" onClick={() => Route.go('/file/224810')}>Zwischenbericht</a></li>
          <li><a href="#" onClick={() => Route.go('/file/17805')}>Einladung</a></li>
        </ul>
        
        <h2>Suche verfeinern</h2>
        <p>Wir nutzen Elasticsearch's <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html">Simple Query String</a>. Wildcards (<code>*</code>) sind erlaubt.</p>

        <h2>Feedback erwünscht</h2>
        <p>Anmerkungen, Verbesserungsvorschläge und Fehlermeldungen <a href="mailto:astro@spaceboyz.net">per Mail</a> oder <a href="https://github.com/offenesdresden/annotieren/issues">auf Github.</a></p>
      </article>
    )
  }
}
