import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import {fetchApi} from './apiFetcher';
import {useQuery} from 'react-query';


export default function MicroManager() {
  const { data, isLoading, isError, refetch } = useQuery('getRoomInfo', () => fetchApi("getRoomInfo"));  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  const theme = useTheme(getTheme());
  const columns=[
    {
        label:"Room", renderCell: (item) => item.name
    },
    {
        label:"Microbit", renderCell: (item) => item.microbit
    },
    {
        label:"Max Temperature", renderCell: (item) => item.maxTemp
    },
    {
        label:"Max Noise", renderCell: (item) => item.maxNoise
    },
    {
        label:"Max Light", renderCell: (item) => item.maxLight
    }
  ]
  const dataArray = Array.isArray(data.rooms.data) ? data.rooms.data : [];
  console.log(dataArray);
  return (
    <div>
    {dataArray.map((item, index) => (
      <p key={index}>
        {item.name}, {item.microbit}, {item.maxTemp}, {item.maxNoise}, {item.maxLight}
      </p>
    ))}
    <CompactTable columns={columns} data={dataArray} theme={theme}></CompactTable>
  </div>
  );
};