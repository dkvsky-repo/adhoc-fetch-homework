import fetch from "../util/fetch-fill.js";
import URI from "urijs";

// /records endpoint
// window.path = "http://localhost:3000/records";
const url = "http://localhost:3000/records";
const uri = new URI(url);

// Your retrieve function plus any additional functions go here ...
async function getData(url) {
  const response = await fetch(url);
  return await response.json();
}

async function getNextPageValue(currentPage) {
  const offset = currentPage * 10;
  const response = await fetch(
    `http://localhost:3000/records?limit=10&offset=${offset}`
  );
  const data = await response.json();
  // console.log(`getNextPageValue: `, data.length === 0 ? null : currentPage + 1);
  return data.length === 0 ? null : currentPage + 1;
}

async function retrieve(options = {}) {
  const limit = 10;
  let offset = 0;
  let colorQueryString = "";
  let previousPage = null;
  let nextPage = undefined;

  // @todo: What happens at page 0? throw error?
  if (options && options.hasOwnProperty("page") && options.page > 0) {
    const { page } = options;
    offset = page * limit - limit;
    previousPage = page !== 1 ? page - 1 : previousPage;
    nextPage = await getNextPageValue(page);
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

  // const response = await fetch(endpoint.toString());
  // const data = await response.json();

  // @todo: remove
  // console.log(data);

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

  nextPage = ids.length === 0 ? null : nextPage;

  // @todo: remove
  console.log({
    ids,
    open,
    closedPrimaryCount,
    previousPage,
    nextPage,
  });

  return {
    ids,
    open,
    closedPrimaryCount,
    previousPage,
    nextPage,
  };
}

// retrieve({ page: 15, colors: ["red", "blue", "brown"] });
retrieve({ page: 0 });
// retrieve({ page: 15 });
// retrieve({ colors: ["red"] });
// retrieve({ page: 2, colors: ["brown"] });

export default retrieve;
