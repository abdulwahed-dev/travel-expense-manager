import { Link, Router } from "../../routes";
import React, { useState } from "react";
import { addDays, parse, subDays } from "date-fns";

import Button from "../elements/Button";
import { CREATE_EXPENSE_MUTATION } from "../../graphql/mutations";
import DatePicker from "react-datepicker";
import DatePickerCustomInput from "./elements/DatePickerCustomInput";
import ErrorField from "./errors/ErrorField";
import ErrorMessage from "./errors/ErrorMessage";
import Label from "./elements/Label";
import Select from "react-select";
import { TRIP_EXPENSES_QUERY } from "../../graphql/queries";
import classNames from "classnames";
import { redirect } from "../../lib/utils";
import uniqBy from "lodash/uniqBy";
import { useMutation } from "@apollo/react-hooks";

const AddExpenseForm = props => {
  const [expense, setExpense] = useState({
    title: "",
    amount: 0,
    date: new Date(),
    currency: {
      value: null,
      label: null
    },
    trip: props.trip.id
  });

  const handleChange = event => {
    setExpense({
      ...expense,
      [event.target.name]: event.target.value
    });
  };

  const handleChangeDate = date => {
    setExpense({
      ...expense,
      date
    });
  };

  const handleChangeCurrency = currency => {
    setExpense({
      ...expense,
      currency
    });
  };

  const [createExpense, { loading, error }] = useMutation(
    CREATE_EXPENSE_MUTATION,
    {
      variables: {
        input: { ...expense, currency: expense.currency.value }
      },
      refetchQueries: [
        {
          query: TRIP_EXPENSES_QUERY,
          variables: { tripId: props.trip.id }
        }
      ]
    }
  );

  // Commented out until the currency exchange is implemented
  // let currencies = props.trip.countries
  //   .map(country => {
  //     return country.currencies.map(currency => {
  //       return {
  //         value: currency.id,
  //         label: `${currency.symbol} (${currency.name})`
  //       };
  //     });
  //   })
  //   .flat();
  let currencies = [];
  currencies.push({
    value: props.trip.baseCurrency.id,
    label: `${props.trip.baseCurrency.symbol} (${props.trip.baseCurrency.name})`
  });
  currencies = uniqBy(currencies, "value");

  return (
    <>
      <div className="w-full">
        <form
          className="pt-4 pb-8 mb-4"
          onSubmit={async e => {
            e.preventDefault();
            const res = await createExpense();
            Router.pushRoute("trip", { id: props.trip.id });
          }}
        >
          <ErrorMessage error={error} />
          <div className="mb-4">
            <Label for="title">Title</Label>
            <input
              className="w-full rounded-lg border border-gray-400 p-3 hover:border-gray-500 focus:border-green-500 input-color-shadow"
              name="title"
              id="title"
              type="text"
              placeholder="Title"
              required
              onChange={handleChange}
              value={expense.title}
            />
            <ErrorField error={error} field="title" />
          </div>
          <div className="flex mb-4">
            <div className="w-1/2 mr-4">
              <Label for="amount">Amount</Label>
              {/* TODO number format */}
              <input
                className="w-full rounded-lg border border-gray-400 p-3 hover:border-gray-500 focus:border-green-500 input-color-shadow"
                name="amount"
                id="amount"
                type="number"
                step="any"
                placeholder="Amount"
                required
                onChange={handleChange}
                value={expense.amount}
              />
              <ErrorField error={error} field="amount" />
            </div>
            <div className="w-1/2 ml-4">
              <Label for="select-currency-add-expense">Currency</Label>
              <Select
                value={expense.currency}
                onChange={handleChangeCurrency}
                options={currencies}
                instanceId="select-currency-add-expense"
                className="react-select"
                classNamePrefix="react-select"
              />
              <ErrorField error={error} field="currency" />
            </div>
          </div>
          <div className="mb-4">
            <Label>Date</Label>
            {/* TODO locale */}
            <DatePicker
              customInput={<DatePickerCustomInput />}
              selected={expense.date}
              onChange={handleChangeDate}
              minDate={new Date(props.trip.startDate)}
              maxDate={new Date(props.trip.endDate)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="d MMMM yyyy H:mm"
              timeCaption="Time"
              peekNextMonth
              showMonthDropdown
              showYearDropdown
              shouldCloseOnSelect={true}
            />
            <ErrorField error={error} field="date" />
          </div>
          <div className="flex items-center justify-end mt-5">
            <Button loading={loading} type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddExpenseForm;
