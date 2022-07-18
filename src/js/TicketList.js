/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
export default class TicketList {
  constructor() {
    this.pageWrapper = document.querySelector('[data-page="wrapper"]');
    this.ticketApp = this.pageWrapper.querySelector('[data-ticket="app"]');
    this.ticketArea = this.ticketApp.querySelector('[data-ticket="area"]');
    this.addTicketForm = document.forms.newTicket;
    this.editTicketForm = document.forms.editTicketForm;
    this.modalWindowDeleteTicket = this.pageWrapper.querySelector('[data-ticket="delete-ticket-window"]');
    this.modalWindowComplieteTicket = this.pageWrapper.querySelector('[data-ticket="compliete-ticket-window"]');
    this.ifDescriptionEmpty = 'Описание отсутствует';

    this.getAllTickets('GET', 'allTickets');
    this.ticketControl();
    this.addNewTicket();
  }

  getAllTickets(method, data) {
    this.request(method, data).then((response) => {
      const arr = JSON.parse(response);
      arr.sort((a, b) => {
        let result = null;
        if (a.created > b.created) result = 1;
        if (a.created < b.created) result = -1;
        return result;
      });
      arr.forEach((item) => this.setTicketOnPage(item));
    });
  }

  request(method, data) {
    return new Promise((resolve) => {
      let url = 'https://ticket-list.herokuapp.com/';
      const xhr = new XMLHttpRequest();

      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
          resolve(xhr.response);
        }
      });

      if (method === 'GET') {
        url = `${url}?${data}`;
        xhr.open(method, url);
        xhr.send();
      } else if (method === 'POST') {
        xhr.open(method, url);
        xhr.send(data);
      }
    });
  }

  setTicketOnPage(ticket) {
    if (ticket.description === undefined) { ticket.description = this.ifDescriptionEmpty; }

    const ticketHtml = `
        <div class="ticket ticketId" name="ticket" data-ticketId="${ticket.id}">
            <div class="ticket-box">
                <div class="ticket__left-side">
                    <div class="ticket__btn ticket__check-box ${ticket.status === 'false' ? '' : 'checked'}" data-ticket-status=${ticket.status} data-ticket="checkBox"></div>
                    <span class="ticket__text" data-ticket="name">${ticket.name}</span>
                </div>
                <div class="ticket__right-side">
                    <span class="ticket__date">${ticket.created}</span>
                    <div class="ticket__btns">
                        <div class="ticket__edit-btn ticket__btn" data-ticket="edit-btn"></div>
                        <div class="ticket__delete-btn ticket__btn" data-ticket="delete-btn"></div>
                    </div>
                </div>
            </div>
            <div class="ticket__description-box">
                <span class="ticket__description-text hidden" data-ticket="description">${ticket.description}</span>
            </div>
        </div>`;

    this.ticketArea.insertAdjacentHTML('beforeend', ticketHtml);
  }

  ticketControl() {
    this.ticketArea.addEventListener('click', (e) => {
      if (e.target.dataset.ticket === 'name') {
        const thisTicket = e.target.closest('.ticketId');
        thisTicket.querySelector('[data-ticket="description"]').classList.toggle('hidden');
      } else if (e.target.dataset.ticket === 'delete-btn') {
        this.deleteTicket(e.target.closest('.ticketId'));
      } else if (e.target.dataset.ticket === 'edit-btn') {
        this.editTicket(e.target.closest('.ticketId'));
      } else if (e.target.dataset.ticket === 'checkBox') {
        this.complieteTicket(e.target.closest('.ticketId'));
      }
    });
  }

  createFormData(form) {
    const fd = new FormData(form);
    fd.set('id', null);
    fd.set('created', this.createDate());
    fd.set('status', false);

    return fd;
  }

  addNewTicket() {
    this.addTicketForm.addEventListener('keydown', (e) => (e.key === 'Enter' ? e.preventDefault() : true));

    const addTicketBtn = this.ticketApp.querySelector('[data-ticket="addTicket__btn"]');
    addTicketBtn.addEventListener('click', () => {
      this.addTicketForm.classList.remove('hidden');
    });

    this.addTicketForm.addEventListener('click', (e) => {
      if (e.target.dataset.createTicketFormBtn === 'cancel-btn') {
        this.addTicketForm.reset();
        this.addTicketForm.classList.add('hidden');
        this.addTicketForm.name.classList.remove('empty');
        this.addTicketForm.name.placeholder = '';
      } else if (e.target.dataset.createTicketFormBtn === 'ok-btn') {
        const input = this.addTicketForm.name;

        if (input.value === '') {
          input.classList.add('empty');
          input.placeholder = 'Это обязательное поле';
          return;
        }

        this.request('POST', this.createFormData(this.addTicketForm)).then((response) => {
          const newTicket = JSON.parse(response);
          this.setTicketOnPage(newTicket);
        });
        this.addTicketForm.reset();
        this.addTicketForm.classList.add('hidden');
      }
    });
  }

  deleteTicket(ticket) {
    const okOrCancel = (e) => {
      if (e.target.dataset.modalWindowDeleteTicket === 'ok-btn') {
        const params = new URLSearchParams();
        params.append('option', 'deleteTicket');
        params.append('id', ticket.dataset.ticketid);

        this.request('GET', params).then((response) => {
          if (response) {
            ticket.remove();
          }
        });

        this.modalWindowDeleteTicket.removeEventListener('click', okOrCancel);
        this.modalWindowDeleteTicket.classList.add('hidden');
      } else {
        this.modalWindowDeleteTicket.removeEventListener('click', okOrCancel);
        this.modalWindowDeleteTicket.classList.add('hidden');
      }
    };

    this.modalWindowDeleteTicket.classList.remove('hidden');
    this.modalWindowDeleteTicket.addEventListener('click', okOrCancel);
  }

  editTicket(ticket) {
    const inputs = this.editTicketForm.elements;
    const ticketName = ticket.querySelector('[data-ticket="name"]');
    const ticketDescription = ticket.querySelector('[data-ticket="description"]');
    const ticketStatus = ticket.querySelector('[data-ticket-status="false"]');

    inputs.name.value = ticketName.textContent;
    inputs.description.value = ticketDescription.textContent;

    this.editTicketForm.classList.remove('hidden');

    const okOrCancel = (e) => {
      if (e.target.dataset.editTicketFormBtn === 'cancel-btn') {
        this.editTicketForm.reset();
        this.editTicketForm.classList.add('hidden');
        this.editTicketForm.removeEventListener('click', okOrCancel);
      } else if (e.target.dataset.editTicketFormBtn === 'ok-btn') {
        const fd = new FormData(this.editTicketForm);

        if (fd.get('description') === this.ifDescriptionEmpty) fd.set('description', '');
        fd.set('id', ticket.dataset.ticketid);
        fd.set('status', ticketStatus.dataset.ticketStatus);

        this.request('POST', fd).then((response) => {
          const editTicket = JSON.parse(response);
          if (editTicket.description === undefined || editTicket.description === '') {
            ticketDescription.textContent = this.ifDescriptionEmpty;
          } else {
            ticketDescription.textContent = editTicket.description;
          }
          ticketName.textContent = editTicket.name;
          ticketStatus.dataset.ticketStatus = editTicket.status;
        });
        this.editTicketForm.reset();
        this.editTicketForm.classList.add('hidden');
        this.editTicketForm.removeEventListener('click', okOrCancel);
      }
    };

    this.editTicketForm.addEventListener('click', okOrCancel);
  }

  complieteTicket(ticket) {
    const checkBox = ticket.querySelector('[data-ticket="checkBox"]');
    const fd = new FormData();
    fd.set('id', ticket.dataset.ticketid);
    fd.set('changeStatus', true);

    if (checkBox.dataset.ticketStatus === 'true') {
      checkBox.dataset.ticketStatus = 'false';
      fd.set('status', false);
      this.request('POST', fd).then(() => {
        checkBox.classList.remove('checked');
      });
    } else if (checkBox.dataset.ticketStatus === 'false') {
      checkBox.dataset.ticketStatus = 'true';
      fd.set('status', true);
      this.request('POST', fd).then(() => {
        checkBox.classList.add('checked');
      });
    }
  }

  createDate() {
    const date = new Date();
    const D = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const M = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const Y = date.getFullYear();
    const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    return `${D}.${M}.${Y} ${hour}:${minutes}`;
  }
}

// eslint-disable-next-line no-new
new TicketList();
