import React from 'react';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WS } from '@deriv/shared';
import ResetPasswordModal from '../reset-password-modal';
import { StoreProvider, mockStore } from '@deriv/stores';
import { APIProvider } from '@deriv/api';
import { TStores } from '@deriv/stores/types';
import { pass, newPass } from './testfileConstants';
import userEvent from '@testing-library/user-event';

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    WS: {
        resetPassword: jest.fn(() => Promise.resolve()),
    },
    useWS: () => undefined,
    getErrorMessages: jest.fn(() => ({
        password_warnings: jest.fn(() => 'common password .'),
        password: jest.fn(() => 'Invalid password.'),
    })),
    redirectToLogin: jest.fn(),
}));

const mock = {
    ui: {
        is_reset_password_modal_visible: true,
        is_loading: false,
    },
    client: {
        verification_code: {
            reset_password: pass,
        },
        setVerificationCode: jest.fn(),
        logout: jest.fn(() => Promise.resolve()),
    },
};

describe('ResetPasswordModal', () => {
    let store = mockStore({});
    beforeEach(() => {
        store = mockStore(mock);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (store: TStores) => {
        render(
            <StoreProvider store={store}>
                <BrowserRouter>
                    <APIProvider>
                        <ResetPasswordModal />
                    </APIProvider>
                </BrowserRouter>
            </StoreProvider>
        );
    };

    it('should not render the reset password modal if is_reset_password_modal_visible is false ', () => {
        store = mockStore({
            ...mock,
            ui: {
                ...mock.ui,
                is_reset_password_modal_visible: false,
            },
        });
        renderComponent(store);
        expect(screen.queryByText('Reset your password')).not.toBeInTheDocument();
    });

    it('should render the reset password modal', () => {
        renderComponent(store);
        expect(screen.getByText('Reset your password')).toBeInTheDocument();
        expect(
            screen.getByText(
                /strong passwords contain at least 8 characters\. combine uppercase and lowercase letters, numbers, and symbols\./i
            )
        ).toBeInTheDocument();
    });

    it('should change input of password and trigger change password button', async () => {
        WS.resetPassword.mockReturnValue(Promise.resolve({ reset_password: 1 }));

        renderComponent(store);

        await waitForElementToBeRemoved(() => screen.getByTestId('dt_initial_loader'));

        const new_password = screen.getByLabelText('Create a password', { selector: 'input' });

        userEvent.type(new_password, newPass);

        expect(new_password).toHaveValue(newPass);
        expect(screen.getByRole('button', { name: /Reset my password/i })).toBeEnabled();

        userEvent.click(
            screen.getByRole('button', {
                name: /reset my password/i,
            })
        );
        await waitFor(() => {
            expect(WS.resetPassword).toHaveBeenCalledWith({
                new_password: newPass,
                reset_password: 1,
                verification_code: pass,
            });
        });
        expect(store.client.setVerificationCode).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(WS.resetPassword).toHaveBeenCalledWith({
                new_password: newPass,
                reset_password: 1,
                verification_code: pass,
            });
        });

        expect(store.client.logout).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Your password has been changed')).toBeInTheDocument();
    });
});
