// /components/CurrentOccupants.js

import React, { useEffect, useState } from "react";
import { fetchCurrentOccupants } from "../utils/api";

const CurrentOccupants = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchCurrentOccupants();
        setData(result);
      } catch (error) {
        console.error("Error fetching current occupants:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold">Current Occupants</h3>
      <div className="mt-4">
        <p>Total: {data.count} people</p>
        <ul className="mt-2">
          {data.users.map((user, index) => (
            <li key={index} className="flex justify-between py-2">
              <span>{user.name}</span>
              <span>{new Date(user.time_in).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CurrentOccupants;
