import { CustomButton } from "@/components";
import { useSupabase } from "@/context/SupabaseProvider";
import type { AccountTypes } from "@/types";
import React, { useEffect, useState } from "react";

interface FilterTypes {
  setFilterKeyword: (keyword: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterDate: (date: string) => void;
  setFilterCasher: (casher: string) => void;
  setFilterPaymentType: (type: string) => void;
}

const Filters = ({
  setFilterKeyword,
  setFilterStatus,
  setFilterDate,
  setFilterCasher,
  setFilterPaymentType,
}: FilterTypes) => {
  const [keyword, setKeyword] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [casher, setCasher] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("");

  const [cashers, setCashers] = useState<AccountTypes[] | []>([]);

  const { supabase } = useSupabase();

  const handleApply = () => {
    if (
      keyword.trim() === "" &&
      status === "" &&
      date === "" &&
      casher === "" &&
      paymentType === ""
    )
      return;

    // pass filter values to parent
    setFilterKeyword(keyword);
    setFilterStatus(status);
    setFilterDate(date);
    setFilterCasher(casher);
    setFilterPaymentType(paymentType);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      keyword.trim() === "" &&
      status === "" &&
      date === "" &&
      casher === "" &&
      paymentType === ""
    )
      return;

    // pass filter values to parent
    setFilterKeyword(keyword);
    setFilterStatus(status);
    setFilterDate(date);
    setFilterCasher(casher);
    setFilterPaymentType(paymentType);
  };

  // clear all filters
  const handleClear = () => {
    setFilterKeyword("");
    setKeyword("");
    setFilterStatus("");
    setStatus("");
    setFilterDate("");
    setDate("");
    setFilterCasher("");
    setCasher("");
    setFilterPaymentType("");
    setPaymentType("");
  };

  useEffect(() => {
    // fetch cashers
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("rdt_users")
          .select()
          .neq("email", "berlcamp@gmail.com")
          .eq("org_id", process.env.NEXT_PUBLIC_ORG_ID)
          .eq("status", "Active");

        if (error) throw new Error(error.message);
        setCashers(data);
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="">
      <div className="items-center space-x-2 space-y-1">
        <form onSubmit={handleSubmit} className="items-center space-y-1">
          <div className="app__filter_container">
            {/* <MagnifyingGlassIcon className="w-4 h-4 mr-1"/> */}
            <input
              type="text"
              placeholder="Search customer"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="app__filter_input"
            />
          </div>
          <div className="app__filter_container">
            <span className="text-xs text-gray-600">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="app__filter_date"
            />
          </div>
          <div className="hidden">
            <span className="text-xs text-gray-600">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="app__filter_select"
            >
              <option>All</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="app__filter_container">
            <span className="text-xs text-gray-600">Payment Type:</span>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="app__filter_select"
            >
              <option value="">All</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit Term</option>
              <option value="check">Check</option>
              <option value="card">Credit/Debit Card</option>
            </select>
          </div>
          <div className="app__filter_container">
            <span className="text-xs text-gray-600">Casher:</span>
            <select
              value={casher}
              onChange={(e) => setCasher(e.target.value)}
              className="app__filter_select"
            >
              <option value="">All</option>
              {cashers.map((user: AccountTypes, index) => (
                <option key={index} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <CustomButton
          containerStyles="app__btn_green"
          title="Apply Filter"
          btnType="button"
          handleClick={handleApply}
        />
        <CustomButton
          containerStyles="app__btn_gray"
          title="Clear Filter"
          btnType="button"
          handleClick={handleClear}
        />
      </div>
    </div>
  );
};

export default Filters;
