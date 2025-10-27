import React, { useEffect } from 'react';
import { loginSchema, type LoginSchemaType } from '../../schemas/login.schema';
import { Form } from '../../../../components/common/Form';
import { InputGroup } from '../../../../components/molecules/InputGroup';
import { Button } from '../../../../components/atoms/Button';
import { FormError } from '../../../../components/atoms/FormError';
import { useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  return (
    <div className="min-h-screen flex justify-center bg-no-repeat from-blue-500 to-purple-600 font-sans pt-10 pb-10 items-center" style={{ backgroundImage: "url('/assets/images/bg.png')" }}>
      <div className='w-xl flex flex-col justify-center  px-4 py-2  bg-white shadow-lg w-ful'>
      <div className="flex items-center space-x-2 mb-6 justify-center">
           
            <h1 className="text-2xl font-bold text-gray-900 mb-12"> <img
              src="/assets/images/logo.png"
              alt=""
              className="rounded w-60 h-60  block"
            />
            </h1>
        </div>
    
      {/* Registration form fields go here */}
       <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6 px-12">Register</h2>
              {/* <Form className="pace-y-4 grid grid-row-2 gap-4 mb-6 w-full px-12">
                 
                <InputGroup
                  label="Email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  className='w-full'
                />
                <FormError message={error ?? undefined} />
                <Button type="submit"  className="w-auto mt-4 m-auto">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Form> */}
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <Button type="submit"  className="w-auto mt-4 m-auto">Register</Button>
      </form>
    </div>
    {/*  */}
    </div>
  );
};

export default RegisterForm;
