import * as React from "react";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { IInputs } from "./generated/ManifestTypes";
import { ControlContext } from "./context/control-context";
import History from "./components/history";
import { useDataverse } from "./hooks";
import Header from "./components/header/header";
import { useMemo, useState } from "react";
import { FilterContext } from "./context/filter-context";
import { sortAudits } from "./utils/utils";

interface IProps {
    context: ComponentFramework.Context<IInputs>
}

export default function App({ context }: IProps) {
    const { formatting, parameters, resources } = context;
    const { isLoading, attributes, audits, onRefresh } = useDataverse(context);
    const [filter, setFilter] = useState<string[]>([]);
    const [order, setOrder] = useState<"descending" | "ascending">("descending");

    const filteredAudits = useMemo(() => {
        const filtered = !filter || filter.length <= 0 ? 
            audits
            : audits.filter((audit) => {
                return audit.attributes.some((attr) => {
                    return filter.some((field) => field === attr.logicalName)
                })
            });

        return sortAudits(filtered, order);
    }, [audits, filter, order])

    const filteredAttributes = useMemo(() => {
        const data = !filter || filter.length <= 0 ? 
                attributes
                : attributes.filter((attr) => filter.some((field) => field == attr.logicalName))

        return data.filter((item) => item.displayName)
                .sort((a, b) => a.displayName!.localeCompare(b.displayName!))
    }, [attributes, filter])

    return (
        <div style={{ width: '100%'}}>
            <FluentProvider theme={webLightTheme}>
                <ControlContext.Provider value={{ context, formatting, parameters, resources }}>
                    {
                        !isLoading && <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 2 }}>
                            <Header 
                                order={order}
                                attributes={attributes} 
                                onFieldsChanged={setFilter} 
                                onRefresh={onRefresh} 
                                onAuditSortOrderChanged={setOrder}
                            />

                            <FilterContext.Provider value={{filter: filteredAttributes}}>
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    <History audits={filteredAudits} />
                                </div>
                            </FilterContext.Provider>
                        </div>
                    }
                </ControlContext.Provider>
            </FluentProvider>
        </div>
    );
}