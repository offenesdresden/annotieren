import React from 'react'
import ReactDOM from 'react-dom'

import Divider from 'material-ui/lib/divider'

import Types from './types'


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
  
  componentDidMount() {
    document.addEventListener('selectionchange', this.handleSelection, true)
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.handleSelection, true)
  }
  
  render() {
    let isCurrent
    let { currentAnnotation } = this.props
    if (currentAnnotation) {
      // isCurrent = fragment =>
      //   fragment.begin >= currentAnnotation.begin &&
      //   fragment.end <= currentAnnotation.end
      isCurrent = fragment =>
        currentAnnotation.begin <= fragment.end &&
        currentAnnotation.end >= fragment.begin
    } else {
      isCurrent = () => false
    }
    
    console.log("DocText.render")
    return (
      <div>
        {this.props.pages.map((page, i) => (
          <div key={i}>
            <Page {...page}
                onClick={this.props.onClick}
                isCurrent={isCurrent}/>
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
  shouldComponentUpdate(nextProps, nextState) {
    console.log("Page.shouldComponentUpdate", this.props.lastUpdate !== nextProps.lastUpdate,
      this.props.isCurrent(this.props), nextProps.isCurrent(nextProps))
    return this.props.lastUpdate !== nextProps.lastUpdate ||
      this.props.isCurrent(this.props) || nextProps.isCurrent(nextProps)
  }
  
  render() {
    console.log("Page.render", this.props)
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
                  isCurrent={this.props.isCurrent}
                  />
            ))}
          </p>
        ))}
      </div>
    )
  }
}

class Inline extends React.Component {
  render() {
    let props = {}
    let style = props.style = mergeStyle({}, this.props.style)

    let { annotations } = this.props
    let annotation
    if (annotations) {
      for(let id in annotations) {
        let annotation1 = annotations[id]
        if (!annotation ||
            (annotation1.begin > annotation.begin) ||
            (annotation1.begin >= annotation.begin && annotation1.end < annotation.end)) {
          annotation = annotation1
        }
      }
    }
    if (annotation) {
      console.log("Render with annotation:", this.props)
      // clickable
      style.cursor = 'pointer'
      props.onClick = ev => {
        this.props.onClick(annotation)
      }
      
      // backgroundColor by type
      let def = findTypeDef(annotation.type)
      style.backgroundColor = def ? `rgb(${def.rgb})` : '#ccc'
      props.title = def.title

      // frame currentAnnotation
      if (this.props.isCurrent(this.props)) {
        console.log("Render current:", this.props)
        style.borderBottom = "1px dotted #333"
        style.paddingBottom = "-1px"
      }
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

// TODO: move to Types module?
function findTypeDef(typeTitle) {
  for(let category of Types) {
    for(let type of category.types) {
      if (type.title === typeTitle) {
        return type
      }
    }
  }

  return null
}
