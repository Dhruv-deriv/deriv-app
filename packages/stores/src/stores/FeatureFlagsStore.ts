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
        // Call cleanup on the existing instance if it exists
        if (FeatureFlagsStore.instance) {
            FeatureFlagsStore.instance.cleanup();
        }

        super('FeatureFlagsStore', () => {
            // Set the default values for the first time.
            if (!this.data) this.update(FLAGS);

            // Update the store data if a new flag was added or removed.
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

        // Assign the new instance to the static property
        FeatureFlagsStore.instance = this;
    }

    cleanup() {
        this.unmount();
    }
}
