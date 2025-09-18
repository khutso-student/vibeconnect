import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BarGraph({ data = [] }) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Convert event date string to local date without time
  const getLocalWeekdayIndex = (dateStr) => {
    const d = new Date(dateStr);
    // Only year, month, day
    const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return localDate.getDay();
  };

  // Count events per day of the current week
  const chartData = weekDays.map((day, index) => {
    const count = data.filter(event => getLocalWeekdayIndex(event.date) === index).length;
    return { name: day, events: count };
  });

  return (
    <div className="bg-white p-2 rounded-2xl border border-[#EAEAEA] w-full h-65 flex flex-col gap-2">
      <div className="flex justify-between items-center mt-2 w-full">
        <h2 className="text-md font-semibold text-[#555555]">Events Overview</h2>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="events" fill="#F46BF9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
