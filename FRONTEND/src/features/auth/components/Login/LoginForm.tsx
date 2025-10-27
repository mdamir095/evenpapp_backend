import React, { useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../../../features/auth/schemas/login.schema';
import type { LoginSchemaType } from '../../../../features/auth/schemas/login.schema';
import { Form } from '../../../../components/common/Form';
import { InputGroup } from '../../../../components/molecules/InputGroup';
import { Button } from '../../../../components/atoms/Button';
import { FormError } from '../../../../components/atoms/FormError';
import { useAuth } from '../../../../features/auth/hooks/useAuth';
import { useAuthActions } from '../../../../features/auth/hooks/useAuthActions';
import { useNavigate } from 'react-router-dom';
import { CheckboxWithLabel } from '../../../../components/molecules/CheckboxWithLabel';
import AuthLayout from '../Layout/AuthLayout';
// import PasswordInput from '../../../components/molecules/PasswordInput';

type LoginFormValues = LoginSchemaType;

const LoginForm: React.FC = () => {
  const { loading, error, isAuthenticated } = useAuth();
  const { login } = useAuthActions();
  const navigate = useNavigate();
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  const rememberedPassword = localStorage.getItem('rememberedPassword');
  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'all',
    defaultValues: {
      email: rememberedEmail ?? '',
      password: rememberedPassword ?? '',
      rememberMe: !!rememberedEmail,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    if (data.rememberMe) {
      localStorage.setItem('rememberedEmail', data.email);
      localStorage.setItem('rememberedPassword', data.password);
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }
    login(data.email, data.password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout>
      
      <h2 className="text-2xl font-semibold text-left text-gray-800 mb-6">Login</h2>
  
      <Button className="flex items-center justify-center w-full py-2 bg-white-200 text-sky-600 rounded-lg p-4 border-2 mb-4" variant="secondary">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
        Sign in with Google
      </Button>
  
      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-blue-300" />
        <span className="px-3 text-sm text-gray-800">OR</span>
        <div className="flex-1 h-px bg-blue-300" />
      </div>
  
      <FormProvider {...methods}>
        <Form<LoginFormValues> onSubmit={onSubmit} schema={loginSchema} className="flex flex-col py-6 bg-white w-full gap-6">
          <InputGroup
            label="Email"
            name="email"
            id="login-username"
            placeholder="Enter your Email"
            autoComplete="username"
            className="w-full"
          />
          {/* <PasswordInput label="Password"
            name="password"
            id="login-password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password" className="w-full" /> */}
          <InputGroup
            label="Password"
            name="password"
            id="login-password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            className="w-full"
          />
          <div className="flex items-center justify-between mb-4 text-sm text-black">
          <Controller
            name="rememberMe"
            control={methods.control}
            render={({ field }) => (
              <CheckboxWithLabel
                name="rememberMe"
                label="Remember me?"
                id="rememberMe"
                checked={field.value || false}
                onChange={field.onChange}
              />
            )}
          />
          <button type="button" onClick={() => navigate('/forgot-password')} className="text-blue-600 hover:underline cursor-pointer font-semibold">Forget Password</button>
          </div>
          <FormError message={error ?? undefined} />
          <Button type="submit" disabled={loading} className="w-auto" size="md">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
      </FormProvider>
    </AuthLayout>
  );
};

export default LoginForm;
