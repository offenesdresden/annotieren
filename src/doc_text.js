import React from 'react'
import ReactDOM from 'react-dom'


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
    return (
      <p style={{ margin: "0.5em 2em", whiteSpace: "pre-wrap", fontFamily: "serif" }}
          >
        {this.props.fragments.map((fragment, i) =>
          <span key={i} style={fragment.style || {}}>
            {fragment.text}
          </span>
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
