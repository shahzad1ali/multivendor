import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "../../static/data";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { createevent } from "../../redux/actions/event";
const CreateEvent = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.events);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscouontPrice] = useState("");
  const [stock, setStock] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDate = (e) => {
    const startDate = new Date(e.target.value);
    const minEndDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    setStartDate(startDate);
    setEndDate(null);
    document.getElementById("end-date").min = minEndDate
      .toISOString()
      .slice(0, 10);
  };

  const handleEndDate = (e) => {
    const endDate = new Date(e.target.value);
    setEndDate(endDate);
  };
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success("Event created Successfuly");
      navigate("/dashboard");
      window.location.reload();
    }
  }, [dispatch, error, success]);

  const today = new Date().toISOString().slice(0, 10);
  const minEndDate = startDate
    ? new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : today;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newForm = new FormData();

    images.forEach((image) => {
      newForm.append("images", image);
    });
    newForm.append("name", name);
    newForm.append("description", description);
    newForm.append("category", category);
    newForm.append("tags", tags);
    newForm.append("originalPrice", originalPrice);
    newForm.append("discountPrice", discountPrice);
    newForm.append("stock", stock);
    newForm.append("shopId", seller._id);
    newForm.append("start_Date", startDate.toISOString());
    newForm.append("finish_Date", endDate.toISOString());

    dispatch(createevent(newForm));
  };

  const handleImageSubmit = (e) => {
    e.preventDefault();
    let files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  return (
    <div className=" w-[90%] 800px:w-[50%] bg-white shadow h-[80vh] p-3 overflow-y-scroll">
      <h5 className="text-xl font-Poppins text-center">Create Event</h5>
      {/* CREATE EVENT FORM */}
      <form onSubmit={handleSubmit}>
        <br />
        <div>
          <label className="pb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your event Product Name"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            cols="30"
            rows="8"
            required
            type="text"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border mt-2 appearance-none block w-full pt-2 px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Your Product event  Description ..."
          >
            {" "}
          </textarea>
        </div>
        <br />
        <div>
          <label className="pb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full mt-2 border h-[35px] rounded-[5px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Choose a Category"> Choose a Category</option>
            {categoriesData &&
              categoriesData.map((i) => (
                <option value={i.title} key={i.title}>
                  {i.title}
                </option>
              ))}
          </select>
        </div>
        <br />
        <div>
          <label className="pb-2">Tags</label>
          <input
            type="text"
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your event Tag Name"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">Original Price</label>
          <input
            type="text"
            name="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Product Price"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Price (with Discount) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="number"
            value={discountPrice}
            onChange={(e) => setDiscouontPrice(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Discount Price"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Stock <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Product Stock"
          />
        </div>
        <div>
          <label className="pb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="=start-date"
            id="start-date"
            min={today}
            value={startDate ? startDate.toISOString().slice(0, 10) : ""}
            onChange={handleStartDate}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Product Stock"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="=end-Date"
            id="end-date"
            min={minEndDate}
            value={endDate ? endDate.toISOString().slice(0, 10) : ""}
            onChange={handleEndDate}
            className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter Product Stock"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Upload Images <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="upload"
            className="hidden"
            multiple
            onChange={handleImageSubmit}
          />
          <div className="w-full flex items-center flex-wrap">
            <label htmlFor="upload">
              <AiOutlinePlusCircle size={30} color="#555" className="mt-2" />
            </label>
            {images &&
              images.map((i) => (
                <img
                  src={URL.createObjectURL(i)}
                  key={i}
                  alt=""
                  className="h-[120px] w-[120px] object-cover m-2"
                />
              ))}
          </div>
          <br />
          <div>
            <input
              type="submit"
              value="Create"
              className="border mt-2 appearance-none block w-full px-3  h-[35px] border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
