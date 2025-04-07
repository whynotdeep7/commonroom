import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { LANGUAGE_VERSIONS } from '../constants';

const LANGUAGES = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' }
];

// Map language values to Monaco editor language ids
const LANGUAGE_MAPPING = {
    'python': 'python',
    'javascript': 'javascript',
    'java': 'java',
    'cpp': 'cpp',
    'csharp': 'csharp',
    'typescript': 'typescript',
    'go': 'go',
    'rust': 'rust'
};

// Initial code templates for each language
const CODE_TEMPLATES = {
    'python': '# Welcome to Python\n\ndef greeting(name):\n    return f"Hello, {name}!"\n\n# Main program\nif __name__ == "__main__":\n    print(greeting("World"))\n    # Add your code here',
    
    'javascript': '// Welcome to JavaScript\n\nfunction greeting(name) {\n    return `Hello, ${name}!`;\n}\n\n// Main program\nconsole.log(greeting("World"));\n// Add your code here',
    
    'java': '// Welcome to Java\n\npublic class Main {\n    public static String greeting(String name) {\n        return "Hello, " + name + "!";\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(greeting("World"));\n        // Add your code here\n    }\n}',
    
    'cpp': '// Welcome to C++\n#include <iostream>\n#include <string>\n\nusing namespace std;\n\nstring greeting(const string& name) {\n    return "Hello, " + name + "!";\n}\n\nint main() {\n    cout << greeting("World") << endl;\n    // Add your code here\n    return 0;\n}',
    
    'csharp': '// Welcome to C#\nusing System;\n\nclass Program {\n    static string Greeting(string name) {\n        return $"Hello, {name}!";\n    }\n    \n    static void Main() {\n        Console.WriteLine(Greeting("World"));\n        // Add your code here\n    }\n}',
    
    'typescript': '// Welcome to TypeScript\n\nfunction greeting(name: string): string {\n    return `Hello, ${name}!`;\n}\n\n// Main program\nconsole.log(greeting("World"));\n// Add your code here',
    
    'go': '// Welcome to Go\npackage main\n\nimport (\n    "fmt"\n)\n\nfunc greeting(name string) string {\n    return fmt.Sprintf("Hello, %s!", name)\n}\n\nfunc main() {\n    fmt.Println(greeting("World"))\n    // Add your code here\n}',
    
    'rust': '// Welcome to Rust\n\nfn greeting(name: &str) -> String {\n    format!("Hello, {}!", name)\n}\n\nfn main() {\n    println!("{}", greeting("World"));\n    // Add your code here\n}'
};

const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    
    const socketRef = useRef();
    const messagesEndRef = useRef();
    const editorRef = useRef(null);
    
    // Function to handle editor mounting
    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            navigate('/');
            return;
        }
        setUsername(storedUsername);

        // Initialize socket connection
        socketRef.current = io('http://localhost:5001', {
            withCredentials: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity
        });

        // Socket connection events
        socketRef.current.on('connect', () => {
            console.log('Socket connected');
            setIsSocketConnected(true);
            
            // Join room upon connection
            socketRef.current.emit('join', { room: roomId, username: storedUsername });
        });

        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsSocketConnected(false);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsSocketConnected(false);
        });

        // Handle initial state
        socketRef.current.on('initial_state', (data) => {
            console.log('Received initial state:', data);
            if (data.code) setCode(data.code);
            if (data.language) setSelectedLanguage(data.language);
            if (data.participants) setParticipants(data.participants);
        });

        // Handle code updates
        socketRef.current.on('code_updated', (data) => {
            console.log('Code updated by:', data.username);
            if (data.username !== storedUsername) {
                setCode(data.code);
            }
        });

        // Handle language updates
        socketRef.current.on('language_updated', (data) => {
            console.log('Language updated by:', data.username);
            if (data.username !== storedUsername) {
                setSelectedLanguage(data.language);
            }
        });

        // Handle chat messages
        socketRef.current.on('new_message', (data) => {
            console.log('New message:', data);
            setMessages(prev => [...prev, data]);
        });

        // Handle user join/leave
        socketRef.current.on('user_joined', (data) => {
            console.log('User joined:', data.username);
            setMessages(prev => [...prev, { username: 'System', message: `${data.username} joined the room` }]);
            setParticipants(prev => {
                // Only add participant if they're not already in the list
                if (!prev.includes(data.username)) {
                    return [...prev, data.username];
                }
                return prev;
            });
        });

        socketRef.current.on('user_left', (data) => {
            console.log('User left:', data.username);
            setMessages(prev => [...prev, { username: 'System', message: `${data.username} left the room` }]);
            setParticipants(prev => prev.filter(user => user !== data.username));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave', { room: roomId, username: storedUsername });
                socketRef.current.disconnect();
            }
        };
    }, [roomId, navigate]);

    // Effect to update code template when language changes
    useEffect(() => {
        // Always update the code template when the language changes
        console.log(`Setting template for ${selectedLanguage}`);
        setCode(CODE_TEMPLATES[selectedLanguage]);
    }, [selectedLanguage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleCodeChange = (value) => {
        setCode(value);
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('code_change', {
                room: roomId,
                code: value,
                username: username
            });
        }
    };

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setSelectedLanguage(newLanguage);
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('language_change', {
                room: roomId,
                language: newLanguage,
                username: username
            });
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('chat_message', {
                room: roomId,
                message: message.trim(),
                username: username
            });
            setMessage('');
        }
    };

    const executeCode = async () => {
        setIsExecuting(true);
        setOutput('');
        setError('');
        
        try {
            const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
                language: selectedLanguage,
                version: LANGUAGE_VERSIONS[selectedLanguage],
                files: [
                    {
                        content: code
                    }
                ]
            });
            
            if (response.data.run) {
                setOutput(response.data.run.output);
                if (response.data.run.stderr) {
                    setError(response.data.run.stderr);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to execute code');
        } finally {
            setIsExecuting(false);
        }
    };

    const handleLeaveRoom = () => {
        // Emit leave event to server
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('leave', { room: roomId, username: username });
            socketRef.current.disconnect();
        }
        
        // Navigate back to home
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            {/* Left Panel - Code Editor */}
            <div className="w-2/3 flex flex-col">
                <div className="p-4 bg-gray-800/50 backdrop-blur-sm shadow-xl flex justify-between items-center border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                        <span className="text-lg font-mono font-bold text-emerald-400">Room: {roomId}</span>
                        <select
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            className="px-4 py-2 bg-gray-700 border border-emerald-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                        <div className={`ml-4 px-2 py-1 rounded-full ${isSocketConnected ? 'bg-emerald-500' : 'bg-red-500'} text-xs`}>
                            {isSocketConnected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLeaveRoom}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold transition-colors"
                        >
                            Leave Room
                        </button>
                        <button
                            onClick={executeCode}
                            disabled={isExecuting}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-bold transition-colors"
                        >
                            {isExecuting ? 'Executing...' : 'Run Code'}
                        </button>
                    </div>
                </div>
                <div className="flex-1">
                    <Editor
                        height="100%"
                        language={LANGUAGE_MAPPING[selectedLanguage]}
                        value={code}
                        onChange={handleCodeChange}
                        onMount={handleEditorDidMount}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            automaticLayout: true,
                            fontFamily: 'Fira Code, monospace'
                        }}
                    />
                </div>
                <div className="p-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
                    <h3 className="text-lg font-mono font-bold text-emerald-400 mb-2">Output</h3>
                    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm h-32 overflow-auto border border-gray-700">
                        {output && <div className="text-green-400">{output}</div>}
                        {error && <div className="text-red-400">{error}</div>}
                    </div>
                </div>
            </div>

            {/* Right Panel - Chat */}
            <div className="w-1/3 flex flex-col border-l border-gray-700">
                <div className="p-4 bg-gray-800/50 backdrop-blur-sm shadow-xl">
                    <div className="mt-4">
                        <h3 className="font-mono font-bold text-emerald-400 mb-2">Participants ({participants.length})</h3>
                        <div className="bg-gray-900 rounded-lg p-2 max-h-24 overflow-y-auto">
                            {participants.map((participant, index) => (
                                <div key={index} className="py-1 px-2 rounded mb-1 bg-gray-800 flex items-center">
                                    <span className="font-mono">{participant}</span>
                                    {participant === username && <span className="ml-2 text-xs bg-emerald-500 px-2 py-0.5 rounded">You</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 p-4 overflow-auto bg-gray-900/50 backdrop-blur-sm">
                    <h3 className="font-mono font-bold text-emerald-400 mb-2">Chat</h3>
                    <div className="space-y-2">
                        {messages.map((msg, index) => (
                            <div key={index} className={`p-2 rounded-lg ${msg.username === 'System' ? 'bg-gray-800/50' : 'bg-gray-800/90'}`}>
                                <span className={`font-bold ${msg.username === 'System' ? 'text-gray-400' : 'text-emerald-400'}`}>{msg.username}: </span>
                                <span>{msg.message}</span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                
                <form onSubmit={handleSendMessage} className="p-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
                    <div className="flex">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-500 text-white rounded-r-lg hover:bg-emerald-600 font-bold transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Room; 