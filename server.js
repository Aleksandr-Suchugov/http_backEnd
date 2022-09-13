/* eslint-disable no-case-declarations */
/* eslint-disable consistent-return */
/* eslint-disable no-return-await */

const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const uuid = require('uuid');

const app = new Koa();
const port = process.env.PORT || 7070;

const tickets = [
  {
    id: 'first',
    name: 'Ticket with description',
    description: 'Remote connection issue',
    status: true,
    created: new Date().toLocaleString(),
  },
  {
    id: 'second',
    name: 'Ticket without description',
    description: '',
    status: false,
    created: new Date().toLocaleString(),
  },
];

app.use(koaStatic(public));

app.use(koaBody({
  text: true,
  urlencoded: true,
  json: true,
}));

app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    next();

    return;
  }

  ctx.response.set('Access-Control-Allow-Origin', '*');

  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');

  ctx.response.status = 204;
});

app.use(async (ctx) => {
  // console.log('request.query.method:', ctx.request.query.method);
  // console.log('request.querystring:', ctx.request.querystring);
  // console.log('request.body:', ctx.request.body);
  ctx.response.body = `server response at port ${port}`;
  const { method } = ctx.request.query;
  switch (method) {
    case 'allTickets':
      ctx.response.body = tickets;
      // console.log('response.body:', ctx.response.body);
      return;
    case 'ticketById':
      // console.log('request.query:', ctx.request.query);
      // console.log('request.query.id:', ctx.request.query.id);
      const ticketById = tickets.find((ticket) => ticket.id === ctx.request.query.id);
      const ticketDescription = ticketById.description;
      // console.log('ticketDescription:', ticketDescription);
      ctx.response.body = ticketDescription;
      // console.log('response.body:', ctx.response.body);
      return;
    case 'createTicket':
      const newTicketId = uuid.v4()
      const formData = ctx.request.body;
      formData.id = newTicketId;
      if (formData.status === 'false') formData.status = 'in progress';
      if (formData.status === 'true') formData.status = 'fixed';
      // console.log('formData.status:', formData.status, typeof formData.status);
      tickets.push(formData);
      // console.log('tickets:', tickets);
      return;
    case 'changeTicketStatus':
      const ticketId = tickets.find((ticket) => ticket.id === ctx.request.body.id);
      // console.log('request.body.id:', ctx.request.body.id);
      if (!ticketId) return;
      ticketId.status = ctx.request.body.status;
      // console.log('ticketId:', ticketId);
      // console.log('tickets:', tickets);
      return;
    case 'removeTicket':
      // console.log('request.body.id:', ctx.request.body.id);
      tickets = tickets.filter((ticket) => ticket.id !== ctx.request.body.id);
      // console.log('tickets:', tickets);
      return;
    case 'editTicket':
      const
        {
          id,
          name,
          description,
          status,
          created,
        } = ctx.request.body;
      // console.log('body:', id, name, description, status, created);
      const tiketUpdate = tickets.find((ticket) => ticket.id === id);
      if (!tiketUpdate) return;
      tiketUpdate.name = name;
      tiketUpdate.description = description;
      tiketUpdate.status = status;
      tiketUpdate.created = created;
      // console.log('tickets:', tickets);
      return;
    default:
      ctx.response.status = 404;
  }
});

app.listen(port, () => console.log(`Koa server is run on port ${port} ...`));