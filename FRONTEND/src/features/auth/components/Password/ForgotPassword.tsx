import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { forgotPasswordSchema, type ForgotPasswordSchemaType } from '../../schemas/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../../../../components/common/Form';
import { InputGroup } from '../../../../components/molecules/InputGroup';
import { Button } from '../../../../components/atoms/Button';
import { FormError } from '../../../../components/atoms/FormError';
import { useAuth } from '../../hooks/useAuth';
import { useAuthActions } from '../../hooks/useAuthActions';
import toast from 'react-hot-toast';
import AuthLayout from '../Layout/AuthLayout';
import { Link } from 'react-router-dom';

type ForgotPasswordFormValues = ForgotPasswordSchemaType;

const ForgotPassword: React.FC = () => {
  const { loading, error } = useAuth();
  const { sendResetLink } = useAuthActions();

  const methods = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'all',
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await sendResetLink(data.email);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Reset link sent successfully');
      methods.reset(); // ✅ reset form using form methods
    }
  };

  return (
    <AuthLayout>
      <FormProvider {...methods}>
        

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Reset Password</h2>

        <Button className="flex items-center justify-center w-full py-2 bg-white-200 text-sky-600 rounded-lg p-4 border-2 mb-4" variant="secondary">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
          Sign in with Google
        </Button>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-blue-300" />
          <span className="px-3 text-sm text-gray-800">OR</span>
          <div className="flex-1 h-px bg-blue-300" />
        </div>

        <Form<ForgotPasswordFormValues>
          onSubmit={onSubmit}
          schema={forgotPasswordSchema}
          className="flex flex-col justify-center bg-white w-full relative p-6 rounded h-full gap-8"
        >
          <InputGroup
            label="Username"
            name="email"
            id="login-username"
            placeholder="Enter your username"
            autoComplete="username"
            className="w-full"
          />
          <FormError message={error ?? undefined} />
          <Button variant='muted' className='w-auto  m-auto text-gray-700'>
            <Link to="/login">Back to Login</Link>
          </Button>
          <Button type="submit" disabled={loading} className="w-auto ">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Form>
      </FormProvider>
    </AuthLayout>
  );
};

export default ForgotPassword;
