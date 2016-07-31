import React from 'react'
import Reflux from 'reflux'

import Paper from 'react-md/lib/Papers'
import { IconButton } from 'react-md/lib/Buttons'
import { CircularProgress } from 'react-md/lib/Progress'
import Snackbar from 'react-md/lib/Snackbars'
import FontIcon from 'react-md/lib/FontIcons'

import Navigation from './navigation'
import DocText from './doc_text'
import AnnotateBar from './annotate_bar'
import { actions as annotateActions } from './annotate_store'


export default React.createClass({
  mixins: [
    Reflux.listenTo(annotateActions.createAnnotation.completed, 'onCreateAnnotationCompleted'),
    Reflux.listenTo(annotateActions.createAnnotation.failed, 'onCreateAnnotationFailed'),
    Reflux.listenTo(annotateActions.updateAnnotation.failed, 'onUpdateAnnotationFailed'),
    Reflux.listenTo(annotateActions.removeAnnotation.completed, 'onRemoveAnnotationCompleted'),
    Reflux.listenTo(annotateActions.removeAnnotation.failed, 'onRemoveAnnotationFailed')
  ],

  getInitialState() {
    return {
      loading: true,
      file: {},
      annotations: [],
      pages: [],
      statusMessage: null
    }
  },

  _fetchFile() {
    return fetch(`/api/oparl/file/${this.props.id}`)
      .then(res => res.json())
      .then(json => {
        // Trigger update:
        this.setState({
          file: json
        })
      })
  },

  _fetchFragments() {
    return fetch(`/api/file/${this.props.id}/fragments`)
      .then(res => res.json())
      .then(json => {
        // Trigger update:
        this.setState({
          pages: preparePageFragments(json)
        })
      })
  },

  _fetchAnnotations() {
    return fetch(`/api/file/${this.props.id}/annotations`)
      .then(res => res.json())
      .then(annotations => {
        for(var annotation of annotations) {
          this.setAnnotationFragments(annotation)
        }
        this.setState({
          annotations: this.state.annotations.concat(...annotations)
        })
      })
  },

  componentDidMount() {
    this.setState({
      loading: true
    }, () => {
      this._fetchFile()
        .then(() => this._fetchFragments())
        .then(() => this._fetchAnnotations())
        .then(() => this.setState({
          loading: false
        }))
        .catch(e => {
          console.error(e.message, e.stack || e)
          this.showStatus(e.message)
          this.setState({
            loading: false
          })
        })
    })
  },

  setAnnotationFragments(annotation) {
    console.log("set", annotation, "fragments")
    this._withFragments(annotation.begin, annotation.end, inline => {
      // console.log("inline to set:", inline)
      if (!inline.annotations) inline.annotations = []
      if (annotation.type !== 'delete') {
        if (inline.annotations.some(annotation1 =>
          annotation.id === annotation1.id
        )) return  // Skip if already present

        inline.annotations.push(annotation)
        inline.annotations = inline.annotations.sort((a, b) => {
          if (a.begin !== b.begin) {
            return b.begin - a.begin
          } else {
            return a.end - b.end
          }
        })
      } else {
        inline.annotations = inline.annotations.filter(annotation1 =>
          annotation.id !== annotation1.id
        )
        if (inline.annotations.length === 0) {
          delete inline.annotations
        }
      }
    })

    // Clear user selection
    document.getSelection().removeAllRanges()
  },

  // TODO: s/<\/p>/\n/
  getFragmentsText(begin, end) {
    let text = ""
    this._withFragments(
      begin, end,
      frag => text += frag.text,
      () => text += "\n"
    )
    return text.replace(/\xA0/g, " ")
  },

  _withFragments(begin, end, fragIter, blockIter, pageIter) {
    this._splitFragments(begin)
    this._splitFragments(end)

    let lastInline
    for(let page of this.state.pages) {
      if (begin <= page.end && page.begin <= end) {
        // console.log("with page", page)
        for(let block of page.contents) {
          if (begin <= block.end && block.begin <= end) {
            // console.log("with block", block)
            for(let inline of block.contents) {
              // At inline level we can assume that _splitFragments()
              // has made the offsets right
              if (begin <= inline.begin && inline.end <= end) {
                // console.log("with inline", inline)
                fragIter(inline)
              }
              lastInline = inline
            }
            if (blockIter && lastInline.end <= end) {
              blockIter()
            }

            // Merge equal inline fragments
            let newContents = []
            for(let inline of block.contents) {
              let lastNew = newContents.length > 0 &&
                newContents[newContents.length - 1]
              if (lastNew &&
                  Object.is(lastNew.style, inline.style) &&
                  Object.is(lastNew.annotations, inline.annotations)) {
                // console.log("Merge", lastNew, inline)
                lastNew.text += inline.text
                lastNew.end = inline.end
              } else {
                newContents.push(inline)
              }
            }
            if (newContents.length !== block.contents.length) {
              console.log(`Merged contents from ${block.contents.length} to ${newContents.length}:`, newContents)
            }
            block.contents = newContents
          }
        }

        if (pageIter && lastInline.end <= end) {
          pageIter()
        }

        // For DocText/Page.shouldComponentUpdate():
        page.lastUpdate = Date.now()
      }
    }
    this.setState({
      pages: this.state.pages
    })
  },

  // ensures that inline fragments are split at certain offset for
  // exact annotation marking
  _splitFragments(offset) {
    for(let page of this.state.pages) {
      if (page.begin <= offset && offset <= page.end) {
        // console.log("Split page", page.begin, "<=", offset, "<=", page.end)
        for(let block of page.contents) {
          if (block.begin <= offset && offset <= block.end) {
            // console.log("Split block", block.begin, "<=", offset, "<=", block.end, ":", block.contents)
            let contents = []
            for(let inline of block.contents) {
              if (inline.begin < offset && offset < inline.end) {
                // console.log("Split inline", inline.begin, "<=", offset, "<=", inline.end)
                let delta = offset - inline.begin
                // console.log(`Split ${inline.begin}..${inline.end} at ${delta}`, inline)

                let inline1 = {}
                Object.assign(inline1, inline)
                inline1.text = inline.text.slice(0, delta)
                inline1.end = inline1.begin + delta
                contents.push(inline1)

                let inline2 = {}
                Object.assign(inline2, inline)
                inline2.text = inline.text.slice(delta)
                inline2.begin = inline1.end
                if (inline1.annotations) {
                  inline2.annotations = [].concat(inline1.annotations)
                }
                contents.push(inline2)
              } else {
                contents.push(inline)
              }
            }
            block.contents = contents
          }
        }
      }
    }
  },

  render() {
    console.log("DocView.render, loading:", this.state.loading,
      "currentAnnotation:", this.state.currentAnnotation && this.state.currentAnnotation.id)
    return (
      <div>
        <Navigation
            title={this.state.loading ? "Laden…" : this.state.file.name}
            right={
              <IconButton
                  tooltipLabel="Original-PDF herunterladen"
                  href={this.state.file.downloadUrl}
                  >
                file_download
              </IconButton>
            }/>

        <Paper className="doc_view" zDepth={2} style={{ marginTop: "64px" }}>
          {this.state.loading ?
            <div style={{ textAlign: 'center', padding: "4em 0" }}>
              <CircularProgress scale={2}/>
            </div> :
            <DocText
                pages={this.state.pages}
                onSelection={slice => this.handleTextSelection(slice)}
                currentAnnotation={this.state.currentAnnotation}
                onClick={annotation => this.handleClickAnnotation(annotation)}
                />
          }
        </Paper>

        <AnnotateBar currentAnnotation={this.state.currentAnnotation}
            onType={this.handleSelectType}
            onDelete={this.handleDeleteAnnotation}
            onMetadata={this.handleMetadata}
            />

        <Snackbar
            toasts={this.state.statusMessage ? [{ text: this.state.statusMessage }] : []}
            dismiss={() => this.setState({ statusMessage: null })}
            />
      </div>
    )
  },

  showStatus(message) {
    this.setState({
      statusMessage: message
    })

    setTimeout(() => {
      if (this.state.statusMessage === message) {
        // If no other showed up, clear Snackbar
        this.setState({
          statusMessage: null
        })
      }
    }, 3000)
  },

  /**
   * DocText events handlers
   **/

  handleTextSelection(slice) {
    if (slice) {
      // Makes it available to AnnotateBar & DocText
      // console.log("new annotation", slice)
      this.setState({
        currentAnnotation: {
          // temporary Id, will be overwritten later with one
          // generated by the server
          id: generateAnnotationId(),
          type: 'new',
          begin: slice.begin,
          end: slice.end
        }
      })
    } else if (this.state.currentAnnotation && this.state.currentAnnotation.type === 'new') {
      // HACK: don't hide annotate_bar before currentAnnotation has
      // been converted into a permanent one
      setTimeout(() => {
        if (this.state.currentAnnotation && this.state.currentAnnotation.type === 'new') {
          // Drop temporary annotation for previous user selection
          this.setState({
            currentAnnotation: null
          })
        }
      }, 300)
    }
  },

  handleClickAnnotation(annotation) {
    if (this.state.currentAnnotation && this.state.currentAnnotation.type === 'new') {
      return
    }

    // console.log("currentAnnotation=", annotation)
    this.setState({
      currentAnnotation: annotation,
      pages: this.state.pages
    })
  },

  /**
   * AnnotateBar events handlers
   **/

  handleSelectType(type) {
    let annotation = this.state.currentAnnotation
    if (!annotation) return

    let isNew = this.state.currentAnnotation.type === 'new'

    if (type !== annotation.type) {
      // Update the type
      annotation.type = type
      // Type updated, remove all metadata
      delete annotation.person
      delete annotation.organization
      delete annotation.meeting
      delete annotation.paper
      delete annotation.file
      delete annotation.location
    }

    if (isNew) {
      annotation.text = this.getFragmentsText(annotation.begin, annotation.end)
      this.setState({
        annotations: this.state.annotations.concat(annotation),
        currentAnnotation: annotation
      })

      annotateActions.createAnnotation(this.props.id, annotation)
    } else {
      annotateActions.updateAnnotation(this.props.id, annotation)
    }

    // create: split fragments, update: let colors refresh
    this.setAnnotationFragments(annotation)
  },

  onCreateAnnotationCompleted(id) {
    let annotation = this.state.currentAnnotation
    if (!annotation) {
      this.showStatus("Keine neue Annotation wurde erstellt o_0")
      return
    }

    this.showStatus("Neue Annotation wurde erstellt.")
    // Update id, having successfully created annotation on the server:
    annotation.id = id
  },

  onCreateAnnotationFailed(e) {
    this.showStatus(`Konnte keine neue Annotation erstellen: ${e.message}`)
  },

  onUpdateAnnotationFailed(e) {
    this.showStatus(e.message)
  },

  handleMetadata(key, value) {
    let annotation = this.state.currentAnnotation
    if (!annotation) {
      console.error("Updating no annotation, this should not happen!")
      return
    }

    if (annotation[key] !== value) {
      // Add the metadata:
      annotation[key] = value
      annotateActions.updateAnnotation(this.props.id, annotation)

      this.setState({
        currentAnnotation: annotation
      })
    }
  },

  handleDeleteAnnotation() {
    let annotation = this.state.currentAnnotation
    if (!annotation) return

    // console.log("delete", this.state.currentAnnotation, "from", this.state.annotations)
    this.setState({
      annotations: this.state.annotations.filter(annotation1 =>
        annotation1.id !== annotation.id
      ),
      currentAnnotation: null
    })
    annotation.type = 'delete'
    this.setAnnotationFragments(annotation)

    annotateActions.removeAnnotation(this.props.id, annotation)
  },

  onRemoveAnnotationCompleted() {
    this.showStatus("Annotation wurde gelöscht.")
  },

  onRemoveAnnotationFailed(e) {
    this.showStatus(e.message)
  }
})

let lastAnnotationId = 0
function generateAnnotationId() {
  return (lastAnnotationId++).toString()
}

// Add begin/end text offsets
function preparePageFragments(pages) {
  let offset = 0

  for(let page of pages) {
    page.begin = offset

    for(let block of page.contents) {
      block.begin = offset

      // Make string-only inline elements proper
      block.contents = block.contents.map(inline => {
        if (typeof inline === 'string') {
          return {
            contents: [inline]
          }
        } else {
          return inline
        }
      })

      for(let inline of block.contents) {
        inline.begin = offset
        // Concat inline text
        inline.text = inline.contents.join("")
        delete inline.contents
        offset += inline.text.length
        inline.end = offset
      }
      block.end = offset
    }
    page.end = offset
  }

  return pages
}
