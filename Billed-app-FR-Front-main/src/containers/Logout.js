import { ROUTES_PATH } from '../constants/routes.js'

export default class Logout {
  constructor({ document, onNavigate, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.localStorage = localStorage
    $('#layout-disconnect').click(this.handleClick)
  }
  
  handleClick = (e) => {
    this.localStorage.clear()
    this.onNavigate(ROUTES_PATH['Login'])
  }
} 



// import { ROUTES_PATH } from '../constants/routes.js'

// export default class Logout {
//   constructor({ document, onNavigate, localStorage }) {
//     this.document = document
//     this.onNavigate = onNavigate
//     this.localStorage = localStorage
//     this.initialize()
//   }
  
//   initialize() {
//     const logoutLink = this.document.getElementById('logout-link')
//     logoutLink.addEventListener('click', this.handleClick)
//   }

//   handleClick = (e) => {
//     e.preventDefault() // Prevent default link behavior
//     this.localStorage.clear()
//     this.onNavigate(ROUTES_PATH['Login'])
//   }
// } 