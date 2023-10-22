// newbill.js
import { ROUTES_PATH } from '../constants/routes.js';
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    this.localStorage = localStorage;
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.file = null;
    this.fileName = null;
    this.fileUrl = null;
    this.billId = null;
    this.isFileUploaded = false;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = e => {
    e.preventDefault();

    const file = e.target.files[0];
    const fileName = e.target.files[0].name;
    const fileFormat = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
    const champFile = e.target;

    if (fileFormat === ".jpg" || fileFormat === ".jpeg" || fileFormat === ".png") {
      champFile.setCustomValidity("");
      this.file = file;
      this.fileName = fileName;
      this.isFileUploaded = false;
    } else {
      champFile.setCustomValidity("Le format doit être JPG, JPEG ou PNG");
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const email = JSON.parse(this.localStorage.getItem("user")).email;
    const expenseType = e.target.querySelector(`select[data-testid="expense-type"]`).value;
    const expenseName = e.target.querySelector(`input[data-testid="expense-name"]`).value;
    const amount = parseInt(e.target.querySelector(`input[data-testid="amount"]`).value);
    const date = e.target.querySelector(`input[data-testid="datepicker"]`).value;
    const vat = e.target.querySelector(`input[data-testid="vat"]`).value;
    const pct = parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20;
    const commentary = e.target.querySelector(`textarea[data-testid="commentary"]`).value;

    const requiredFields = {
      'expense-type': 'Type de dépense',
      'expense-name': 'Nom de la dépense',
      'amount': 'Montant TTC',
      'datepicker': 'Date',
      'vat': 'TVA',
      'pct': 'Taux de TVA',
      'file': 'Justificatif'
    };

    let isError = false;
    let errors = {}; // Object to track error fields

    // Check if all required fields are filled
    Object.entries(requiredFields).forEach(([field, fieldName]) => {
      const inputField = e.target.querySelector(`[data-testid="${field}"]`);
      if (inputField.value.trim() === '') {
        inputField.classList.add('error');
        inputField.setAttribute('aria-invalid', 'true');
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = `Le champ "${fieldName}" est obligatoire.`;
        inputField.parentNode.appendChild(errorMessage);
        isError = true;
      } else {
        inputField.classList.remove('error');
        inputField.setAttribute('aria-invalid', 'false');
        const errorMessage = inputField.parentNode.querySelector('.error-message');
        if (errorMessage) {
          errorMessage.parentNode.removeChild(errorMessage);
        }
      }
    });

    if (!isError) {
      if (this.file) {
        try {
          const formData = new FormData();
          formData.append('file', this.file);
          formData.append('email', email);

          const { fileUrl, key } = await this.store.bills().create({
            data: formData,
            headers: {
              noContentType: true
            }
          });

          this.billId = key;
          this.fileUrl = fileUrl;
          this.isFileUploaded = true;
        } catch (error) {
          console.error(error);
        }
      }

      const bill = {
        email,
        type: expenseType,
        name: expenseName,
        amount,
        date,
        vat,
        pct,
        commentary,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending',
      };

      this.createOrUpdateBill(bill);
      this.onNavigate(ROUTES_PATH['Bills']);
    } else {
      
         console.log('Please fill in all the required fields.');
         return;
    }
  };

  createOrUpdateBill = (bill) => {
    if (this.store) {
      if (this.billId && this.isFileUploaded) {
        this.store.bills()
          .update({ data: JSON.stringify(bill), selector: this.billId })
          .then(() => {
            console.log('Bill updated');
          })
          .catch(error => console.error(error));
      } else {
        this.store.bills()
          .create({ data: JSON.stringify(bill) })
          .then(({ data }) => {
            this.billId = data.id;
            console.log('New bill created');
          })
          .catch(error => console.error(error));
      }
    }
  };
}
