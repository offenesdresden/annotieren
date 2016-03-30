import React from 'react'
import ReactDOM from 'react-dom'

import Divider from 'material-ui/lib/divider'

import { getTypeById } from './types'


export default class DocText extends React.Component {
  constructor(props) {
    super(props)

    this.handleSelection = (e) => {
      let slice
      let sel = document.getSelection()
      for(var i = 0; !slice && i < sel.rangeCount; i++) {
        let range = sel.getRangeAt(i)
        let slice1 = this._rangeToSlice(range)
        if (slice1.begin < slice1.end) {
          slice = slice1
        }
      }

      this.props.onSelection(slice)
    }
  }

  _rangeToSlice(range) {
    let el = ReactDOM.findDOMNode(this)
    return {
      begin: getTextOffset(el, range.startContainer, range.startOffset),
      end: getTextOffset(el, range.endContainer, range.endOffset)
    }
  }

  // also hook 'mouseup' in addition to 'selectionchange' because the
  // latter is not enabled on Firefox
  componentDidMount() {
    document.addEventListener('selectionchange', this.handleSelection, true)
    document.addEventListener('mouseup', this.handleSelection, true)
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.handleSelection, true)
    document.removeEventListener('mouseup', this.handleSelection, true)
  }

  render() {
    return (
      <div>
        {this.props.pages.map((page, i) => (
          <div key={i}>
            <Page {...page}
                onClick={this.props.onClick}
                currentAnnotation={this.props.currentAnnotation}/>
            <Divider/>
          </div>
        ))}
      </div>
    )
  }
}

function getTextOffset(el, target, targetOffset) {
  if (el === target) {
    return targetOffset
  } else {
    let offset = 0
    for(let child = el.firstChild; child; child = child.nextSibling) {
      let childOffset = getTextOffset(child, target, targetOffset)
      if (typeof childOffset === 'number') {
        offset += childOffset
        return offset
      } else {
        offset += child.textContent.length
      }
    }

    return null
  }
}

class Page extends React.Component {
  _isCurrent(props) {
    if (!props.currentAnnotation) return false

    let { begin, end } = props.currentAnnotation
    return begin <= props.end && props.begin <= end
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.lastUpdate !== nextProps.lastUpdate ||
      this._isCurrent(this.props) || this._isCurrent(nextProps)
  }

  render() {
    let style = mergeStyle({
      margin: "0 auto",
      whiteSpace: "pre-wrap"
    }, this.props.style)
    return (
      <div style={style}>
        {this.props.contents.map((block, i) => (
          <p key={i} style={mergeStyle({}, block.style)}>
            {block.contents.map((inline, j) => (
              <Inline key={j} {...inline}
                  onClick={this.props.onClick}
                  currentAnnotation={this.props.currentAnnotation}/>
            ))}
          </p>
        ))}
      </div>
    )
  }
}

class Inline extends React.Component {
  _isCurrent() {
    if (!this.props.currentAnnotation) return false

    let { begin, end } = this.props.currentAnnotation
    return begin <= this.props.begin && this.props.end <= end
  }

  render() {
    let props = {}
    let style = props.style = mergeStyle({}, this.props.style)

    let { annotations } = this.props
    let annotation = annotations && annotations[0]
    if (annotation) {
      // console.log("Render with annotation:", this.props)
      // clickable
      style.cursor = 'pointer'
      props.onClick = ev => {
        this.props.onClick(annotation)
      }

      // backgroundColor by type
      let def = getTypeById(annotation.type)
      style.backgroundColor = def ? `rgb(${def.rgb})` : '#ccc'

      // frame currentAnnotation
      if (this._isCurrent()) {
        // console.log("Render current:", this.props)
        style.borderBottom = "1px dotted #333"
        style.paddingBottom = "-1px"
      }
    }
    if (annotations) {
      props.title = annotations.map(annotation => getTypeById(annotation.type).title)
        .join("/")
    }
    return (
      <span {...props}>
        {this.props.text}
      </span>
    )
  }
}

function mergeStyle(style, input) {
  if (!input) return style

  for(let k in input) {
    let reactKey = k.replace(/-[a-z]/g, match => match[1].toUpperCase())
    style[reactKey] = input[k]
  }

  return style
}
