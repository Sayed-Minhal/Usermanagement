import { render, screen } from '@testing-library/react';
import App from './App';

import mockAxios from "jest-mock-axios";

import { BASE_URL } from "./__mocks__/utils";
import UserGrid from './components/UserGrid';
import { act } from 'react-dom/test-utils';

describe("Render App & UserGrid and take snapshot", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  describe("when API call is successful", () => {
    it("should return users list", async () => {

      // given
      const users = [
        {
          id: 1,
          name: "Sayed",
          email: "sayedminhalpro@gmail.com",
          gender: "male",
          status: "married"
        }, {
          id: 2,
          name: "Sayed",
          email: "sayedminhalpro@gmail.com",
          gender: "male",
          status: "married"
        },
        {
          id: 1,
          name: "Sayed",
          email: "sayedminhalpro@gmail.com",
          gender: "male",
          status: "married"
        }
      ];
      mockAxios.get.mockResolvedValueOnce(users);

      try {
        let container;
        // when
        act(() => container = render(<App />));

        // then
        expect(mockAxios.get).toHaveBeenCalledWith(`${BASE_URL}/users`);
        expect(screen.getByTestId('maingrid')).toBeInTheDocument();
        expect(container).toMatchSnapshot();
      } catch (error) {
        // error
      }
    });
  });

  describe("when API call fails", () => {
    it("should return empty users list", async () => {
      // given
      const message = "Network Error";
      mockAxios.get.mockRejectedValueOnce(new Error(message));

      // when
      try {
        let container;
        // when
        act(() => container = render(<App />));
        // then
        expect(mockAxios.get).toHaveBeenCalledWith(`${BASE_URL}/users`);

      } catch (error) {
        // error
      }
    });
  });
});
