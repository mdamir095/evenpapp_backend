import React from 'react';
import { changePasswordSchema , type ChangePasswordSchemaType } from '../../schemas/login.schema';
import { Form } from '../../../../components/common/Form';
import { InputGroup } from '../../../../components/molecules/InputGroup';
import { Button } from '../../../../components/atoms/Button';
import { FormError } from '../../../../components/atoms/FormError';
import { useAuth } from '../../hooks/useAuth';
import { useAuthActions } from '../../hooks/useAuthActions';
import toast from 'react-hot-toast';
import { CircleCheckBig } from 'lucide-react';
import PasswordInput from '../../../../components/molecules/PasswordInput';

// import Layout from '../../../layouts/Layout';

type ChangePasswordFormValues = ChangePasswordSchemaType;

const ChangePassword: React.FC = () => {
    const { loading, error } = useAuth();
    const { changePassword } = useAuthActions();

    const onSubmit = async (
        data: ChangePasswordFormValues,
        reset: () => void
    ) => {
        changePassword(data.currentPassword,data.newPassword,data.confirmPassword);
        if(error){
            toast.error(error);
        }else{
            toast.success('Password reset successfully');
            reset(); // reset form after creation
        }    
    };
  
  return (
  
          <div className='flex flex-col j pt-6 pb-6 rounded-xl px-8 border  border-gray-300 bg-white m-auto'>
            <h2 className="text-2xl font-semibold text-left text-gray-800 gap-4  ">Change Password</h2>
            <Form<ChangePasswordFormValues> mode="all" schema={changePasswordSchema} onSubmit={onSubmit} className="pace-y-4 grid grid-row-1 gap-4 mb-6 w-full py-6">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white min-w-full">
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                id="currentPassword"
                placeholder="Enter your current password"
                autoComplete="currentPassword"
                className='w-full'
              />
             <PasswordInput 
                 label="New Password"
                name="newPassword"
                id="newPassword"
                placeholder="Enter your new password"
                autoComplete="newPassword"
                className='w-full'/>
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Enter your confirm password"
                autoComplete="confirmPassword"
                className='w-full'
              />
              </div>
            <ul className="text-sm text-gray-600 mb-6 font-medium pl-0 space-y-1  list-none">
              <li> <CircleCheckBig size={14} className="text-sky-600"/>Minimum 8 characters</li>
              <li> <CircleCheckBig  size={14} className="text-sky-600"/>Uppercase & lowercase letters</li>
              <li><CircleCheckBig  size={14}className="text-sky-600"/>Special characters (e.g. @, $, #)</li>
            </ul>
              <FormError message={error ?? undefined} />
              <div className='flex gap-6  justify-center space-x-4  mr-auto mt-6'>
              <Button type="submit" disabled={loading} className="w-auto mt-4 m-auto">
                {loading ? 'Sending...' : 'Reset Password'}
              </Button>
              <Button type="button" disabled={loading} variant='accent' className="w-auto mt-4 m-auto">
                {loading ? 'Sending...' : 'Cancel'}
              </Button>
              </div>
            </Form>
            {/*  */}
            </div>
       
    
  );
};

export default ChangePassword;
