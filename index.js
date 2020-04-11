const store = new class {
  constructor() {
    this.state = {};
    this.deps = {};
    this.defer = false;
    this.deferDeps = [];
    this.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
  }
  subscribe(dep, listener){
    if(!this.hasOwn(this.deps, dep)){ this.deps[dep] = [] }

    const idx = this.deps[dep].push(listener) - 1

    return function unSubscribe() {
      delete this.deps[dep][idx]
    }
  }
  publish(dep, nextState){
    // merge
    Object.assign(this.state, nextState)
    // not exist dep: exit
    if(!this.hasOwn(this.deps, dep)){ return }

    if(this.deferDeps.indexOf(dep) === -1){ this.deferDeps.push(dep) }
    
    if(!this.defer) {
      this.defer = true
      Promise.resolve().then(() => {
        this.deferDeps.forEach(dep => {
          this.deps[dep].forEach((listener) => {
            listener(this.state)
          })
        })
        this.defer = false
        this.deferDeps = []
      })
    }
  }
}

store.subscribe("user", (state) => {
  console.log("[subscriber:user] : ", state)
})

store.subscribe("board", (state) => {
  console.log("[subscriber:board] : ", state)
})

/* Subscribing event handlers are called only once. ( because of merged update ) */
store.publish("user", { user: { name: "rlgus" }} )
store.publish("user", { user: { name: "wlgud" }} )
store.publish("user", { user: { name: "ehddms" }} )
store.publish("user", { user: { name: "duddbs" }} )
/* Subscribing event handlers are called only once. ( because of merged update ) */
store.publish("board", { board: { title: "today is..."} })
store.publish("board", { board:{ title: "lucky day!"} })

/* not working merged update ( because of async ) */
getUser("0001", 4000).then((data) => {
  store.publish("user", { user: data })
})
getUser("0002", 5000).then((data) => {
  store.publish("user", { user: data })
})
getUser("0003", 6000).then((data) => {
  store.publish("user", { user: data })
})

function getUser (name, ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ name })
    }, ms)
  })
}

function getBoard (title, ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ title })
    }, ms)
  })
}
