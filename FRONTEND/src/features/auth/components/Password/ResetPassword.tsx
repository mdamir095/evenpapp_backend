import React from 'react';
import { resetPasswordSchema, type ResetPasswordSchemaType  } from '../../schemas/login.schema';
import { Form } from '../../../../components/common/Form';
import { InputGroup } from '../../../../components/molecules/InputGroup';
import { Button } from '../../../../components/atoms/Button';
import { FormError } from '../../../../components/atoms/FormError';
import { useAuth } from '../../hooks/useAuth';
import { useAuthActions } from '../../hooks/useAuthActions';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

type ResetFormValues = ResetPasswordSchemaType;

const ResetPassword: React.FC = () => {
    const { loading, error } = useAuth();
    const { resetPassword } = useAuthActions();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const onSubmit = async (
        data: ResetFormValues,
        reset: () => void
    ) => {
        resetPassword(data.newPassword, token!);
        if(error){
            toast.error(error);
        }else{
            toast.success('Password reset successfully');
            reset(); // reset form after creation
        }    
    };
  
  return (
    <div className="min-h-screen flex justify-center bg-no-repeat from-blue-500 to-purple-600 font-sans pt-10 pb-10 items-center" style={{ backgroundImage: "url('/assets/images/bg.png')" }}>
          <div className='w-xl flex flex-col justify-center  px-4 py-2  bg-white shadow-lg w-ful'>
          <div className="flex items-center space-x-2 mb-6 justify-center">
               
                <h1 className="text-2xl font-bold text-gray-900 mb-2"> <img
                  src="/assets/images/logo.png"
                  alt=""
                  className="rounded w-60 h-60  block"
                />
                </h1>
            </div>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6 px-12">Reset Password</h2>
            <Form<ResetFormValues> mode="all" schema={resetPasswordSchema} onSubmit={onSubmit} className="pace-y-4 grid grid-row-2 gap-4 mb-6 w-full px-12">
               
              <InputGroup
                label="New Password"
                name="newPassword"
                id="newPassword"
                placeholder="Enter your new password"
                autoComplete="newPassword"
                className='w-full'
              />
              <InputGroup
                label="Confirm New Password"
                name="confirmNewPassword"
                id="confirmNewPassword"
                placeholder="Enter your confirm new password"
                autoComplete="confirmNewPassword"
                className='w-full'
              />
              <FormError message={error ?? undefined} />
              <Button type="submit" disabled={loading} className="w-auto mt-4 m-auto">
                {loading ? 'Sending...' : 'Reset Password'}
              </Button>
               <Button type="button" disabled={loading} variant='muted' className="w-auto mt-4 m-auto">
                    {loading ? 'Sending...' : 'Cancel'}
                </Button>
            </Form>
            {/*  */}
            </div>
          </div>
  );
};

export default ResetPassword;
