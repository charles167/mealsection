function InputField({ label, type, value, onChange, placeholder, name }) {
  return (
    <div className="">
      <label className="block text-sm font-[500] text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full placeholder:text-[12px] mt-2 rounded-[10px] border-1 border-gray-200 bg-gray-50/50 py-3 px-4 text-sm focus:border-[var(--default)] focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300"
      />
    </div>
  );
}

export default InputField;
