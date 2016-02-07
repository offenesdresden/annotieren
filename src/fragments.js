export default class Fragments {
  constructor(fragments) {
    this.fragments = fragments
    this.map = (...args) => this.fragments.map(...args)
  }

  // TODO: rewrite as in-place
  merge() {
    let n1 = this.fragments.length
    
    let fragments = []
    this.fragments.forEach(frag => {
      let prevFrag = fragments[fragments.length - 1]
      if (fragments.length > 0 && Object.is(frag.annotation, prevFrag.annotation)) {
        // Merge
        prevFrag.text += frag.text
      } else {
        // Append
        fragments.push(frag)
      }
    })

    this.fragments = fragments

    let n2 = this.fragments.length
    console.log(`Merged ${n1} fragments into ${n2}`)
  }

  splitFragment(position) {
    let offset = 0
    for(let i = 0; i < this.fragments.length; i++) {
      let length = this.fragments[i].text.length
      if (offset + length <= position) {
        offset += length
      } else {
        let delta = position - offset
        if (delta > 0) {
          let oldFragmentJSON = JSON.stringify(this.fragments[i])
          let before = JSON.parse(oldFragmentJSON)
          before.text = before.text.slice(0, delta)
          before.end = before.begin + delta
          let after = JSON.parse(oldFragmentJSON)
          after.text = after.text.slice(delta)
          after.begin = before.end
          this.fragments.splice(i, 1, before, after)
        }
        return
      }
    }
  }
  
  withFragments(begin, end, iterCb) {
    this.splitFragment(begin)
    this.splitFragment(end)
    
    let offset = 0
    this.fragments.forEach(fragment => {
      let nextOffset = offset + fragment.text.length
      if (offset >= begin && nextOffset <= end) {
        iterCb(fragment)
      }
      offset = nextOffset
    })

    this.merge()
  }
}
