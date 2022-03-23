import React, { useEffect, useState } from "react";
import GridTable from '@nadavshaar/react-grid-table';
import axios from 'axios';

const UserGrid = () => {
    const [tableData, setTableData] = useState([]);

    const cellEditHandler = ({ tableManager, value, data, column, colIndex, rowIndex, onChange }) => (
        <div style={{display: 'inline-flex'}}>
            <button 
                style={{marginLeft: 20}} 
                onClick={e => tableManager.rowEditApi.setEditRowId(null)}
            >&#x2716;</button>
            <button 
                style={{marginLeft: 20, marginRight: 20}} 
                onClick={async e => {
                    // let rowsClone = [...rows];
                    let rowsClone = await tableManager.rowsApi.rows.map(row => row.id === data.id? row : data);
                    // let updatedRowIndex = rowsClone.find(r => r.id === data.id);
                    console.log( tableManager, rowsClone, "Updated row index");
                    // rowsClone[updatedRowIndex] = data;

                    setTableData(rowsClone);
                    tableManager.rowEditApi.setEditRowId(null);
                }
            }>&#x2714;</button>
        </div>
    );

    const columns = [
        {
            id: 1, 
            field: 'id', 
            label: 'User ID',
            className: 'rgt-cell-align-left',
            width: '10%'
        }, 
        {
            id: 2, 
            field: 'name', 
            label: 'User Name',
            className: 'rgt-cell-align-left',
            width: '70%'
        },
        {
            id: 'my-buttons-column',
            width: '10%',
            pinned: true,
            sortable: false,
            resizable: false,
            cellRenderer: ({ tableManager, value, data, column, colIndex, rowIndex }) => (
                <button 
                    style={{marginLeft: 20}} 
                    onClick={e => tableManager.rowEditApi.setEditRowId(data.id)}
                >&#x270E;</button>
            ),
            editorCellRenderer: cellEditHandler
        }
    ];
    useEffect(()=>{
        axios.get('http://localhost:8181/users').then(result => {console.log(result); setTableData(result.data)});
    },[]);
    

    return (<GridTable columns={columns} rows={tableData} style={{width:'95%'}}/>);
};

export default UserGrid;