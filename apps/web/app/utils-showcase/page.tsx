import { UtilsExample } from '../components/utils-example';

export default function UtilsShowcasePage() {
  const exampleData = {
    title: 'Testing the Utils Package',
    date: new Date('2024-04-10'),
    longText:
      'This is a long text that will be truncated by the truncate function. It demonstrates how the utils package can help with common operations like string manipulation, date formatting, and more.',
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
    ],
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Utils Package Showcase</h1>
      <p className="mb-8">
        This page demonstrates how the @repo/utils package can be used across
        the application to provide consistent functionality.
      </p>

      <UtilsExample {...exampleData} />

      <div className="mt-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Available Utilities</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>String Utils:</strong> capitalize, slugify, truncate,
            generateRandomString
          </li>
          <li>
            <strong>Array Utils:</strong> chunk, unique, shuffle, groupBy
          </li>
          <li>
            <strong>Object Utils:</strong> pick, omit, deepClone, isEqual
          </li>
          <li>
            <strong>Date Utils:</strong> formatDate, formatDateTime, timeAgo
          </li>
          <li>
            <strong>Validation:</strong> emailSchema, passwordSchema,
            slugSchema, urlSchema
          </li>
          <li>
            <strong>UI Utils:</strong> cn (for Tailwind class composition)
          </li>
        </ul>
      </div>
    </div>
  );
}
