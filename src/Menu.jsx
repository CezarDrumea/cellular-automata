export default function Menu({ onSelect }) {
  return (
    <div className='menu'>
      <h1>Alege modelul CA</h1>
      <button onClick={() => onSelect('life')}>Game of Life</button>
      <button onClick={() => onSelect('fire')}>Fire Spread</button>
      <button onClick={() => onSelect('sir')}>SIR Epidemic</button>
    </div>
  );
}
