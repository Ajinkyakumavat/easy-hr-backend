class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    // console.log(this.query)
    if (!this.queryStr.searchBy) {
      this.queryStr.searchBy = "name";
    }
    let oris = [];
    for (let i = 0; i < this.queryStr.searchBy.split(",").length; i++) {
      oris.push({
        [this.queryStr.searchBy.split(",")[i]]: {
          $regex: this.queryStr.keyword ? this.queryStr.keyword : "",
          $options: "i",
        },
      });
    }

    const keyword = this.queryStr.keyword
      ? {
          $or: oris,
        }
      : {};

    this.query = this.query.find(keyword);
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    //Removing unwanted fields from queryStr like keyword,limit,page
    //We removing elements from queryStr coz there is no such presence in our mongoDB document
    const removeFields = ["keyword", "limit", "page", "sorted","searchBy"];
    removeFields.forEach((el) => delete queryCopy[el]);

    console.log(queryCopy);
    //Advance filtering for Price, Ratings and many more
    // Why JSON.stringify ? queryCopy contain object for apply functionalities need to convert into String
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`); //(gt|gte|lt|lte) this are mongo operators

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resPerPage) {
    const currentPage = parseInt(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
  sort() {
    this.query = this.query.sort({ createdAt: this.queryStr.sorted });
    return this;
  }
}

module.exports = APIFeatures;
