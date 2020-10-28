import fetch from "../util/fetch-fill.js";
import URI from "urijs";

// /records endpoint
const url = "http://localhost:3000/records";
const uri = new URI(url);

// Your retrieve function plus any additional functions go here ...
/* ====== start helper functions ====== */
async function getData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error.message);
  }
}

async function calculateNextPageValue(currentPage) {
  try {
    const offset = currentPage * 10;
    const limit = 10;
    const endpoint = uri.search(`limit=${limit}&offset=${offset}`);
    const response = await fetch(endpoint.toString());
    const data = await response.json();
    return data.length === 0 ? null : currentPage + 1;
  } catch (error) {
    console.log(error.message);
  }
}
/* ====== end helper functions ====== */

async function retrieve(options = {}) {
  const limit = 10;
  let offset = 0;
  let colorQueryString = "";
  let previousPage = null;
  let nextPage = null;

  if (options && options.hasOwnProperty("page") && options.page > 0) {
    const { page } = options;
    offset = page * limit - limit;
    previousPage = page !== 1 ? page - 1 : previousPage;
    nextPage = await calculateNextPageValue(page);
  } else {
    nextPage = 2;
  }

  if (options && options.hasOwnProperty("colors")) {
    const { colors } = options;
    colors.map((color) => {
      colorQueryString += `&color[]=${color}`;
    });
  }

  const endpoint = uri.search(
    `limit=${limit}&offset=${offset}${colorQueryString}`
  );

  const data = await getData(endpoint.toString());

  let ids = [];
  let open = [];
  let closedPrimaryCount = 0;

  data.map((item) => {
    ids.push(item.id);
    if (item.disposition === "open") {
      item["isPrimary"] = item.color.match(/(red|blue|yellow)/g) ? true : false;
      open.push(item);
    }
    if (
      item.disposition === "closed" &&
      item.color.match(/(red|blue|yellow)/g)
    ) {
      closedPrimaryCount++;
    }
  });

  // Update value to null if no item ids are returned.
  nextPage = ids.length === 0 ? null : nextPage;

  return Promise.resolve({
    ids,
    open,
    closedPrimaryCount,
    previousPage,
    nextPage,
  });
}

export default retrieve;
