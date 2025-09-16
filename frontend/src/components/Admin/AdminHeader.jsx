import React from "react";
import { BiMessageSquareDetail } from "react-icons/bi";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Avatar } from "../../assests/asset";
import { AiOutlineGift } from "react-icons/ai";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useSelector } from "react-redux";
import { backend_url } from "../../server";

const AdminHeader = () => {
  const { user } = useSelector((state) => state.user);

  const avatarUrl = user?.avatar?.url;
  const fullAvatarUrl =
    avatarUrl && !avatarUrl.startsWith("http")
      ? `${backend_url}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`
      : avatarUrl || Avatar;
  return (
    <div className="w-full h-20 bg-white shadow sticky top-0 left-0 z-30 flex items-center justify-between px-4">
      {/* TOP LEFT LOGO  */}
      <div>
        <Link to="/">
          <img
            src="https://shopo.quomodothemes.website/assets/images/logo.svg"
            alt=""
          />
        </Link>
      </div>
      {/* TOP RIGHT LOGO  */}
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          {/* GITF COUPONS */}
          <Link to="/dashboard-coupons" className="800px:block hidden">
            <AiOutlineGift
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          {/* EVENTS ICONS */}
          <Link to="/dashboard-events" className="800px:block hidden">
            <MdOutlineLocalOffer
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          {/* SHOPPING BAG */}
          <Link to="/dashboard-products" className="800px:block hidden">
            <FiShoppingBag
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          {/*  ALL ORDERS FOR SELLER */}
          <Link to="/dashboard-orders" className="800px:block hidden">
            <FiPackage color="#555" size={30} className="mx-5 cursor-pointer" />
          </Link>
          {/*MESSAGES FROM CUSTOMERS */}
          <Link to="/dashboard-messages" className="800px:block hidden">
            <BiMessageSquareDetail
              color="#555"
              size={30}
              className="mx-5 cursor-pointer"
            />
          </Link>
          {/* SELLER PROFILE */}

          <img
            src={fullAvatarUrl}
            onError={(e) => {
              e.target.src = Avatar;
            }}
            className="w-10 h-10 border-green-700 rounded-full border-3"
            alt="User Avatar"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
