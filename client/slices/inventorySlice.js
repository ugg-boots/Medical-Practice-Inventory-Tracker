import { createSlice, createAsyncThunk, rejectWithValue, current } from '@reduxjs/toolkit';
import { fetchProducts } from './catalogSlices';
// Create slice accepts an initial state, an object full of reducer functions, and a slice "name". It automatically
// generates action creators and action types that correspond to the reducers and state. 
// The slice object is passed to createReducer, so reducers may safely 'mutate' the state they are given

export const fetchProductId = createAsyncThunk(
  'inventory/fetchProductId',
  async (id, thunkAPI) => {
    try{
      const fetchedData =  await fetch(`/api/inventory/query?product_id=${id}`).then((res) => res.json());
      console.log("fetchProductId data ", fetchedData);
      if(!Array.isArray(fetchedData)) fetchedData = [];
        return fetchedData;
      }
   catch(err) {
     console.log('InventorySlicer fetchProductId: ERROR: ', err);
     if(!err.response) throw err;
     return thunkAPI.rejectWithValue(err.response.data);
  }
} 
);
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, thunkAPI) => {
    try{
      const fetchedData =  await fetch(`/api/inventory`).then((res) => res.json());
      console.log("fetchInventory data ", fetchedData);
      if(!Array.isArray(fetchedData)) fetchedData = [];
        return fetchedData;
      }
   catch(err) {
     console.log('InventorySlicer fetchInventory: ERROR: ', err);
     if(!err.response) throw err;
     return thunkAPI.rejectWithValue(err.response.data);
  }
} 
);



//posting data to database
export const postInventory = createAsyncThunk(
  'inventory/postInventory', 
  async(body,thunkAPI) => {
    console.log("body received", body)
    try{
      const postedBody = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'Application/JSON'
        },
        body: JSON.stringify(body)
      })
        .then(resp => resp.json())
    }
    catch(err) {
      console.log('InventorySlicer postInventory: ERROR: ', err);
      if(!err.response) throw err;
      return thunkAPI.rejectWithValue(err.response.data)
    }
  }
);
// const getDate = () => {
//   let today = new Date();
//   const dd = String(today.getDate()).padStart(2, '0');
//   const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//   const yyyy = today.getFullYear();
//   today = yyyy + '-' + mm + '-' + dd;
//   return today;
// };


const inventorySlice = createSlice({
  name: 'inventory',
  initialState: { 
    allProductNames: [],
    groupedInventory : {},
    allInventory: [],
    displayedInventory: [],
    body : {}
  },
  reducers: { 
  },
  extraReducers: {
      [fetchProducts.fulfilled] : (state,action) => {
          // console.log("fetchProductName returned ",action.payload);
          action.payload.forEach((el) => {
            state.allProductNames.push(el.product_name);
          });
      },
      [fetchInventory.fulfilled] : (state,action) => {
        // console.log("fetchInventory returned ",action.payload);
        action.payload.forEach((el) => {
          if(state.groupedInventory.hasOwnProperty(el.product_id)) {
            state.groupedInventory[el.product_id].push(el);
          
          }
          else {
            state.groupedInventory[el.product_id]=[el];
          }
          state.allInventory.push(el);
        });

        for (const id in state.groupedInventory) {
          console.log("in data displayed")
          const newInvent = {};
          newInvent.product_id = id;
          newInvent.quantity = 0;
          newInvent.product_name = state.groupedInventory[id][0].product_name;
          newInvent.metadata = [];
          // newInvent.expiratation_date = groupedInventory[id][0].expiration_date; 
          state.groupedInventory[id].forEach((el) => {
            newInvent.quantity += el.quantity;
            newInvent.metadata.push(el);
          })
          state.displayedInventory.push(newInvent);
        };
    }
    },
  }
);

export const {getDataDisplayed} = inventorySlice.actions; 
export default inventorySlice.reducer; 
