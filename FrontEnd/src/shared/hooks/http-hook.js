import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState();

	// useRef meaning we will not re-initialize the data when
	// this function runs again. So it basically stores data across re-render cycle.
	const activeHttpRequests = useRef([]);

	// wrap it with useCallback to avoid this function getting re-created when
	// the component that uses this hook re-rendered
	// argument [] is the dependency as in useEffect, in our case there is no dependencies
	const sendRequest = useCallback(
		async (url, method = 'GET', headers = {}, body = null) => {
			setIsLoading(true);
			/**
			 * Usage case of AbortController() is when the request been submitted
			 * but not completed, at the same time, user switched to a different page
			 * by clicking a different link/button.  We need to abort the current http
			 * request since we are no longer on the submit page.
			 */
			const httpAbortCtrl = new AbortController();
			activeHttpRequests.current.push(httpAbortCtrl);

			try {
				// fetch sends a http request to backend
				// the request needs to match backend clubsRoutes /signup route
				const response = await fetch(url, {
					method,
					headers,
					body,
					// signal links httpAbortCtrl to fetch request, so we will be able to use
					// httpAbortCtrl to cancel the request
					signal: httpAbortCtrl.signal,
					credentials: 'include'
				});

				// parse the response body, this is the response back from back
				const responseData = await response.json();

				// once request completes, we want to remove the httpAbortCtrl
				activeHttpRequests.current = activeHttpRequests.current.filter(
					// keep everything except httpAbortCtrl
					reqCtrl => reqCtrl !== httpAbortCtrl
				);

				// response with 400/500 status code
				if (!response.ok) {
					throw new Error(responseData.message);
				}
				setIsLoading(false);
				return responseData;
			} catch (err) {
				setError(err.message);
				setIsLoading(false);
				throw err;
			}
		},
		[]
	);

	const clearError = () => {
		setError(null);
	};

	/**
	 * useEffect cannot just be used to run some logic whenever a component re-renders,
	 * but also to cleanup or to run some cleanup logic when a component unmounts.
	 * The way it works is in useEffect we will return a cleanup fcuntion.  React will run
	 * it when the component un-mounts.
	 **/
	useEffect(() => {
		// here we want to abort the abortCtrl.  abortCtrl is the only requests inside of
		// the activeHttpRequests => activeHttpRequests.current.push(httpAbortCtrl);
		return () => {
			activeHttpRequests.current.forEach(abortCtrl =>
				abortCtrl.abort()
			);
		};
	}, []);

	return { isLoading, error, sendRequest, clearError };
};
