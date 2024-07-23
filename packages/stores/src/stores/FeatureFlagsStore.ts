import BaseStore from './BaseStore';

const FLAGS = {
    dtrader_v2: false,
    next_cashier: false,
    p2p_v2: false,
    sharkfin: false,
    wallet: false,
} satisfies Record<string, boolean>;

export default class FeatureFlagsStore extends BaseStore<{ [k in keyof typeof FLAGS]: boolean }> {
    private static instance: FeatureFlagsStore | null = null;

    constructor() {
        if (FeatureFlagsStore.instance) {
            FeatureFlagsStore.instance.cleanup();
        }

        super('FeatureFlagsStore', () => {
            if (!this.data) this.update(FLAGS);
            if (this.data && Object.keys(this.data).length !== Object.keys(FLAGS).length) {
                this.update(old => {
                    const data = FLAGS;

                    Object.keys(FLAGS).forEach(flag => {
                        // @ts-expect-error flag key is always present in the object, Hence can ignore the TS error.
                        if (old[flag] !== undefined) data[flag] = old[flag];
                    });

                    return data;
                });
            }
        });

        this.data = FLAGS;
        FeatureFlagsStore.instance = this;
    }

    cleanup() {
        this.unmount();
    }
}
