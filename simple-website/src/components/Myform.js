import React, { useState } from 'react';
import {Button} from "flotiq-components-react";

const MyForm = () => {
  const INIT_STATE= {
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: '',
    field6: '',
    field7: '',
    field8: '',
    field9: '',
    field10: '',
  }
  const [formData, setFormData] = useState(INIT_STATE);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormData(INIT_STATE);
  };

  return (
    <div className="pb-10">
      <form className="flex flex-col items-center justify-center" onSubmit={handleSubmit}>
        <label>
          Field 1:
          <input
            type="text"
            name="field1"
            value={formData.field1}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Field 2:
          <input
            type="text"
            name="field2"
            value={formData.field2}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Field 3:
          <input
            type="text"
            name="field3"
            value={formData.field3}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Field 4:
          <input
            type="text"
            name="field4"
            value={formData.field4}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Field 5:
          <input
            type="text"
            name="field5"
            value={formData.field5}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Field 6:
          <input
            type="text"
            name="field6"
            value={formData.field6}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Field 7:
          <input
            type="text"
            name="field7"
            value={formData.field7}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Field 8:
          <input
            type="text"
            name="field8"
            value={formData.field8}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Field 9:
          <input
            type="text"
            name="field9"
            value={formData.field9}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Field 10:
          <input
            type="text"
            name="field10"
            value={formData.field10}
            onChange={handleChange}
          />
        </label>
        <br />
        <Button addictionalClass={["align-center"]} variant="secondary" size="md" label={"Submit"} type="submit"/>
      </form>
      {formSubmitted && <p>Form submitted successfully!</p>}
    </div>
  );
};

const App = () => {
  return (
    <div>
      <MyForm />
    </div>
  );
};

export default App;
