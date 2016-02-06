import React from 'react'
import ReactDOM from 'react-dom'

import Types from './types'


export default class DocText extends React.Component {
  constructor(props) {
    super(props)
    
    this.handleSelection = (e) => {
      let slice
      let sel = document.getSelection()
      for(var i = 0; !slice && i < sel.rangeCount; i++) {
        let range = sel.getRangeAt(i)
        let slice1 = this.rangeToSlice(range)
        if (slice1.begin < slice1.end) {
          slice = slice1
        }
      }
      console.log("slice", slice)
      if (this.props.onSelection) {
        this.props.onSelection(slice)
      }
    }
  }
  
  componentDidMount() {
    document.addEventListener('selectionchange', this.handleSelection, true)
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.handleSelection, true)
  }
  
  render() {
    // TODO: have a fragment.id generated for key=
    return (
      <p style={{ margin: "0.5em 2em", whiteSpace: "pre-wrap", fontFamily: "serif" }}
          >
        {this.props.fragments.map((fragment, i) =>
          <DocFragment key={i} {...fragment} onClick={this.props.onClick}/>
        )}
      </p>
    )
  }

  rangeToSlice(range) {
    let el = ReactDOM.findDOMNode(this)
    return {
      begin: getTextOffset(el, range.startContainer, range.startOffset),
      end: getTextOffset(el, range.endContainer, range.endOffset)
    }
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

class DocFragment extends React.Component {
  render() {
    let props = { style: {} }
    let annotationIds = this.props.annotations ? Object.keys(this.props.annotations) : []
    if (annotationIds.length > 0) {
      let { style } = props
      // clickable
      style.cursor = 'pointer'
      props.onClick = ev => {
        this.props.onClick(this.props.annotations)
      }
      
      // backgroundColor by type
      let annotation =
        this.props.annotations[annotationIds[annotationIds.length - 1]]
      let def = findTypeDef(annotation.type)
      style.backgroundColor = def ? `rgb(${def.rgb})` : '#ccc'

      // TODO: frame currentAnnotation
    }
    return (
      <span {...props}>
        {this.props.text}
      </span>
    )
  }
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
