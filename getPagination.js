const getPagination = (page, size) => {
    const limit = size ? +size : 25; // Default to 25 if not specified
    const offset = page ? (page - 1) * limit : 0; // Adjusted to use (page - 1) for correct calculation
    return { limit, offset };
  };
  

module.exports=getPagination;